import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "./navbar";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import * as tokenStorage from "@/lib/auth/token-storage";

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

  it("shows the user's name and a logout button when logged in", async () => {
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
    await waitFor(() => expect(screen.getByTestId("nav-username")).toHaveTextContent("Asha Citizen"));
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("renders all core module links", async () => {
    renderNavbar();
    await waitFor(() => expect(screen.getByText("Log in")).toBeInTheDocument());
    expect(screen.getByText("Missing Persons")).toBeInTheDocument();
    expect(screen.getByText("SOS")).toBeInTheDocument();
    expect(screen.getByText("Blood Donation")).toBeInTheDocument();
    expect(screen.getByText("Disaster Mode")).toBeInTheDocument();
  });
});
