import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RequestList } from "./request-list";
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

const mockRequest = {
  id: "r1",
  patient_name: "John",
  blood_group: "O+" as const,
  units_needed: 2,
  hospital: null,
  city: "Bengaluru",
  urgency: "critical" as const,
  status: "open" as const,
  notes: "Emergency surgery",
  latitude: null,
  longitude: null,
  responses: [],
  created_at: "2026-01-01T00:00:00Z",
};

function renderList() {
  return render(
    <AuthProvider>
      <RequestList />
    </AuthProvider>,
  );
}

describe("RequestList", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the public list without requiring authentication", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockRequest] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText(/O\+ for John/)).toBeInTheDocument());
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.headers?.Authorization).toBeUndefined();
  });

  it("does not show a respond button when logged out", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockRequest] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText(/O\+ for John/)).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "I can donate" })).not.toBeInTheDocument();
  });

  it("shows a respond button when logged in and records the response", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    // RequestList's own effect is unconditional (the list is public) and, as a
    // child of AuthProvider, fires before AuthProvider's /auth/me/ effect —
    // so the public list request resolves first here, not auth.
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockRequest] }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: "u1", full_name: "Asha", email: "a@x.com", phone: null, role: "citizen",
          is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
        }),
      ); // /auth/me/

    renderList();
    await waitFor(() => expect(screen.getByRole("button", { name: "I can donate" })).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "resp1", donor: "u1", donor_name: "Asha", status: "offered", created_at: "2026-01-01T00:00:00Z" }));
    await userEvent.click(screen.getByRole("button", { name: "I can donate" }));

    await waitFor(() => expect(screen.getByText(/1 donor\(s\) responded/)).toBeInTheDocument());
  });
});
