import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hero } from "./hero";
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

function renderHero() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <Hero />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("Hero", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a sign-up CTA when logged out", async () => {
    renderHero();
    await waitFor(() => expect(screen.getByText(/get started/i)).toBeInTheDocument());
    expect(screen.queryByText("Go to SOS")).not.toBeInTheDocument();
  });

  it("shows a Go to SOS CTA when logged in", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "Asha", email: "a@x.com", phone: null, role: "citizen",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderHero();
    await waitFor(() => expect(screen.getByText("Go to SOS")).toBeInTheDocument());
  });

  it("renders the headline and browse-reports link", async () => {
    renderHero();
    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("ResQ India"));
    expect(screen.getByText("Browse missing persons")).toBeInTheDocument();
  });
});
