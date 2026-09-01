import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportList } from "./report-list";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

// The feed uses the reduced PII-safe public serializer shape.
const mockReport = {
  id: "r1",
  public_slug: "abc123",
  name: "Jane Doe",
  age: 30,
  gender: "female" as const,
  clothing_description: "Blue kurta",
  last_seen_location: "MG Road, Bengaluru",
  last_seen_at: "2026-07-01T10:00:00Z",
  status: "missing" as const,
  photos: [],
  created_at: "2026-07-01T10:00:00Z",
};

function renderReportList() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <ReportList />
      </AuthProvider>
    </LanguageProvider>,
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

  it("shows the feed without requiring login", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(
      jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockReport] }),
    );

    renderReportList();
    await waitFor(() => expect(screen.getByText("Jane Doe, 30")).toBeInTheDocument());
    expect(screen.getAllByText(/MG Road, Bengaluru/).length).toBeGreaterThan(0);
  });

  it("shows an empty state when there are no reports", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(
      jsonResponse({ count: 0, num_pages: 0, current_page: 1, next: null, previous: null, results: [] }),
    );

    renderReportList();
    await waitFor(() => expect(screen.getByText(/no missing person reports/i)).toBeInTheDocument());
  });

  it("opens the Instagram-style post modal when a card is clicked", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((input: RequestInfo) => {
      const url = String(input);
      if (url.includes("/comments/")) return Promise.resolve(jsonResponse([]));
      return Promise.resolve(
        jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockReport] }),
      );
    });

    renderReportList();
    await waitFor(() => expect(screen.getByText("Jane Doe, 30")).toBeInTheDocument());

    await userEvent.click(screen.getByText("View details & comments"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Blue kurta")).toBeInTheDocument();
  });
});
