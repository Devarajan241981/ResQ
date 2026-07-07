import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportList } from "./report-list";
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

const mockUser = {
  id: "u1",
  full_name: "Asha Citizen",
  email: "asha@example.com",
  phone: null,
  role: "citizen" as const,
  is_verified: true,
  preferred_language: "en",
  profile_photo: null,
  date_joined: "2026-01-01T00:00:00Z",
};

const mockReport = {
  id: "r1",
  public_slug: "abc123",
  share_url: "http://localhost:3000/missing-persons/abc123",
  name: "Jane Doe",
  age: 30,
  gender: "female" as const,
  height_cm: null,
  weight_kg: null,
  clothing_description: "",
  last_seen_location: "MG Road, Bengaluru",
  last_seen_at: "2026-07-01T10:00:00Z",
  latitude: null,
  longitude: null,
  medical_conditions: "",
  languages_spoken: [],
  status: "missing" as const,
  risk_score: "6.00",
  ai_summary: "",
  qr_code: null,
  photos: [],
  emergency_contacts: [],
  sightings: [],
  created_at: "2026-07-01T10:00:00Z",
};

function renderReportList() {
  return render(
    <AuthProvider>
      <ReportList />
    </AuthProvider>,
  );
}

describe("ReportList", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prompts login when unauthenticated", async () => {
    renderReportList();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/log in/i));
  });

  it("shows an empty state when there are no reports", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(jsonResponse(mockUser)) // /auth/me/
      .mockResolvedValueOnce(jsonResponse({ count: 0, num_pages: 0, current_page: 1, next: null, previous: null, results: [] }));

    renderReportList();
    await waitFor(() => expect(screen.getByText(/no missing person reports/i)).toBeInTheDocument());
  });

  it("renders a report card for each result", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(jsonResponse(mockUser))
      .mockResolvedValueOnce(
        jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockReport] }),
      );

    renderReportList();
    await waitFor(() => expect(screen.getByText("Jane Doe, 30")).toBeInTheDocument());
    expect(screen.getByText(/MG Road, Bengaluru/)).toBeInTheDocument();
  });
});
