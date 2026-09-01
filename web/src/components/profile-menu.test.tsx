import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileMenu } from "./profile-menu";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import * as tokenStorage from "@/lib/auth/token-storage";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "u1", full_name: "Asha Citizen", email: "asha@example.com", phone: null, role: "citizen",
    is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
    ...overrides,
  };
}

function renderMenu() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <ProfileMenu variant="solid" />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("ProfileMenu", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders nothing when logged out", () => {
    renderMenu();
    expect(screen.queryByTestId("nav-username")).not.toBeInTheDocument();
  });

  it("opens a dropdown with the user's details and a logout action", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(mockUser()));

    renderMenu();
    await waitFor(() => expect(screen.getByTestId("nav-username")).toHaveTextContent("AC"));

    await userEvent.click(screen.getByTestId("nav-username"));
    expect(screen.getByText("Asha Citizen")).toBeInTheDocument();
    expect(screen.getByText("asha@example.com")).toBeInTheDocument();
    // Citizens don't get an admin shortcut.
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Log out"));
    await waitFor(() => expect(screen.queryByTestId("nav-username")).not.toBeInTheDocument());
  });

  it("shows an admin shortcut for admin accounts", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(mockUser({ full_name: "Root Admin", role: "super_admin" })));

    renderMenu();
    await waitFor(() => expect(screen.getByTestId("nav-username")).toHaveTextContent("RA"));

    await userEvent.click(screen.getByTestId("nav-username"));
    expect(screen.getByRole("link", { name: "Admin" })).toHaveAttribute("href", "/admin");
  });
});
