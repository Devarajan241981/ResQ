import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublicReportView } from "./public-report-view";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

describe("PublicReportView", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches by slug without requiring auth and renders the report", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        public_slug: "abc123",
        name: "Jane Doe",
        age: 30,
        gender: "female",
        clothing_description: "Blue shirt",
        last_seen_location: "MG Road, Bengaluru",
        last_seen_at: "2026-07-01T10:00:00Z",
        status: "missing",
        photos: [],
        created_at: "2026-07-01T10:00:00Z",
      }),
    );

    render(<PublicReportView slug="abc123" />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument());
    expect(screen.getByText("Blue shirt")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/missing-persons/public/abc123/"),
      expect.anything(),
    );
    // Public endpoint must never require an Authorization header.
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("shows an error message if the slug doesn't exist", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "Not found." }, 404));

    render(<PublicReportView slug="missing-slug" />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/not found/i));
  });
});
