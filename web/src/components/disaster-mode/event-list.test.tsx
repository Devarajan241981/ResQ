import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventList } from "./event-list";
import { AuthProvider } from "@/lib/auth/auth-context";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

const mockEvent = {
  id: "e1",
  name: "Bengaluru Flood",
  disaster_type: "flood" as const,
  description: "",
  affected_area: "Koramangala",
  radius_km: "10",
  status: "active" as const,
  latitude: null,
  longitude: null,
  started_at: "2026-01-01T00:00:00Z",
  ended_at: null,
  open_needs_count: 3,
  created_at: "2026-01-01T00:00:00Z",
};

function renderList() {
  return render(
    <AuthProvider>
      <EventList />
    </AuthProvider>,
  );
}

describe("EventList", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads active events without requiring authentication", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockEvent] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText(/Bengaluru Flood/)).toBeInTheDocument());
    expect(screen.getByText("3 open need(s) reported")).toBeInTheDocument();
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("status=active");
  });

  it("shows an empty state when there are no active events", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 0, num_pages: 0, current_page: 1, next: null, previous: null, results: [] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText(/no active disaster events/i)).toBeInTheDocument());
  });
});
