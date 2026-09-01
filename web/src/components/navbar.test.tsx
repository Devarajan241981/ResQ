import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "./navbar";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import * as tokenStorage from "@/lib/auth/token-storage";

// Navbar renders the notifications bell, which navigates via useRouter.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

function renderNavbar() {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>,
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows login/sign up links when logged out", async () => {
    renderNavbar();
    await waitFor(() => expect(screen.getByText("Log in")).toBeInTheDocument());
    expect(screen.getByText("Sign up")).toBeInTheDocument();
    expect(screen.queryByTestId("nav-username")).not.toBeInTheDocument();
  });

  it("shows a profile avatar (not login links) when logged in", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1",
        full_name: "Asha Citizen",
        email: "asha@example.com",
        phone: "+919800000003",
        role: "citizen",
        is_verified: true,
        preferred_language: "en",
        profile_photo: null,
        date_joined: "2026-01-01T00:00:00Z",
      }),
    );

    renderNavbar();
    // The navbar shows an initials avatar named after the user, not the raw name.
    await waitFor(() => expect(screen.getByTestId("nav-username")).toHaveAccessibleName("Asha Citizen"));
    expect(screen.getByTestId("nav-username")).toHaveTextContent("AC");
    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
  });

  it("renders all core module links", async () => {
    renderNavbar();
    await waitFor(() => expect(screen.getByText("Log in")).toBeInTheDocument());
    expect(screen.getByText("Missing Persons")).toBeInTheDocument();
    expect(screen.getByText("SOS")).toBeInTheDocument();
    expect(screen.getByText("Blood Donation")).toBeInTheDocument();
    expect(screen.getByText("Disaster Mode")).toBeInTheDocument();
  });

  it("exposes a mobile hamburger that toggles the drawer", async () => {
    const user = userEvent.setup();
    renderNavbar();
    const menuBtn = await screen.findByRole("button", { name: "Menu" });
    expect(menuBtn).toHaveAttribute("aria-expanded", "false");
    await user.click(menuBtn);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "true");
    // The drawer surfaces the login actions for a logged-out visitor.
    expect(screen.getAllByText("Sign up").length).toBeGreaterThan(0);
  });
});
