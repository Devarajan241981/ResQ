import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportPostModal } from "./report-post-modal";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import * as tokenStorage from "@/lib/auth/token-storage";
import type { PublicFeedReport } from "@/lib/api/types";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

const report: PublicFeedReport = {
  id: "r1",
  public_slug: "abc123",
  name: "Jane Doe",
  age: 30,
  gender: "female",
  clothing_description: "Blue kurta",
  last_seen_location: "MG Road, Bengaluru",
  last_seen_at: "2026-07-08T10:00:00Z",
  status: "missing",
  photos: [],
  created_at: "2026-07-08T12:00:00Z",
};

const mockMe = {
  id: "u2", full_name: "Vikram Helper", email: "v@x.com", phone: null, role: "citizen",
  is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
};

function renderModal(onClose = vi.fn()) {
  render(
    <LanguageProvider>
      <AuthProvider>
        <ReportPostModal report={report} onClose={onClose} />
      </AuthProvider>
    </LanguageProvider>,
  );
  return onClose;
}

describe("ReportPostModal", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows report details and a login prompt when logged out", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(jsonResponse([]));

    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe, 30")).toBeInTheDocument();
    expect(screen.getByText("Blue kurta")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("No comments yet.")).toBeInTheDocument());
    expect(screen.getByText(/log in to comment/i)).toBeInTheDocument();
    expect(screen.queryByText("I spotted this person")).not.toBeInTheDocument();
  });

  it("lets a logged-in user comment", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/me/")) return Promise.resolve(jsonResponse(mockMe));
      if (url.includes("/comments/") && init?.method === "POST") {
        return Promise.resolve(
          jsonResponse(
            { id: "c1", author: "u2", author_name: "Vikram Helper", content: "Shared locally.", created_at: "2026-07-09T00:00:00Z" },
            201,
          ),
        );
      }
      return Promise.resolve(jsonResponse([]));
    });

    renderModal();
    await waitFor(() => expect(screen.getByLabelText("Add a comment…")).toBeInTheDocument());
    await userEvent.type(screen.getByLabelText("Add a comment…"), "Shared locally.");
    await userEvent.click(screen.getByRole("button", { name: "Post" }));
    await waitFor(() => expect(screen.getByText("Shared locally.")).toBeInTheDocument());
  });

  it("sends a sighting alert to the family", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/me/")) return Promise.resolve(jsonResponse(mockMe));
      if (url.includes("/sightings/") && init?.method === "POST") {
        return Promise.resolve(jsonResponse({ id: "s1" }, 201));
      }
      return Promise.resolve(jsonResponse([]));
    });

    renderModal();
    await waitFor(() => expect(screen.getByText("I spotted this person")).toBeInTheDocument());
    await userEvent.click(screen.getByText("I spotted this person"));

    await userEvent.type(screen.getByLabelText(/where did you see/i), "KR Market");
    await userEvent.type(screen.getByLabelText(/what did you see/i), "Boarding a bus");
    await userEvent.click(screen.getByRole("button", { name: "Alert the family" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/family has been alerted/i));
  });
});
