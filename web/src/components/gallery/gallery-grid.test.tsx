import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryGrid } from "./gallery-grid";
import { LanguageProvider } from "@/lib/i18n/language-context";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

function renderGrid() {
  return render(
    <LanguageProvider>
      <GalleryGrid />
    </LanguageProvider>,
  );
}

describe("GalleryGrid", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an empty state when there are no photos", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 0, num_pages: 0, current_page: 1, next: null, previous: null, results: [] }),
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText(/no photos yet/i)).toBeInTheDocument());
  });

  it("renders published photos with caption and uploader", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        count: 1,
        num_pages: 1,
        current_page: 1,
        next: null,
        previous: null,
        results: [
          {
            id: "g1", uploaded_by: "u2", uploader_name: "Seva Trust",
            image: "http://localhost:8020/media/gallery/camp.jpg", caption: "Relief camp, day 2",
            created_at: "2026-07-01T00:00:00Z",
          },
        ],
      }),
    );

    renderGrid();
    await waitFor(() => expect(screen.getByText("Relief camp, day 2")).toBeInTheDocument());
    expect(screen.getByText(/Seva Trust/)).toBeInTheDocument();
  });
});
