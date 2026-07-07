import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveTicker } from "./live-ticker";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

describe("LiveTicker", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows live disaster events and blood requests from public endpoints", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          count: 1,
          num_pages: 1,
          current_page: 1,
          next: null,
          previous: null,
          results: [
            {
              id: "e1",
              name: "Bengaluru Flood",
              disaster_type: "flood",
              affected_area: "Koramangala",
              status: "active",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          count: 1,
          num_pages: 1,
          current_page: 1,
          next: null,
          previous: null,
          results: [
            { id: "r1", blood_group: "O+", city: "Bengaluru", urgency: "critical", status: "open" },
          ],
        }),
      );

    render(<LiveTicker />);

    await waitFor(() => expect(screen.getAllByText(/Bengaluru Flood/).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/O\+ needed in Bengaluru/).length).toBeGreaterThan(0);

    // No Authorization header — this must work for logged-out visitors too.
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.headers?.Authorization).toBeUndefined();
  });

  it("falls back to static messages when both public endpoints fail", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockRejectedValue(new Error("network error"));

    render(<LiveTicker />);

    await waitFor(() =>
      expect(screen.getAllByText(/Report a missing person/).length).toBeGreaterThan(0),
    );
  });
});
