import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CtaSection } from "./cta-section";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as tokenStorage from "@/lib/auth/token-storage";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

describe("CtaSection", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the signup CTA when logged out", async () => {
    render(
      <AuthProvider>
        <CtaSection />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText("Create your free account")).toBeInTheDocument());
  });

  it("renders nothing when already logged in", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "Asha", email: "a@x.com", phone: null, role: "citizen",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    const { container } = render(
      <AuthProvider>
        <CtaSection />
      </AuthProvider>,
    );
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
