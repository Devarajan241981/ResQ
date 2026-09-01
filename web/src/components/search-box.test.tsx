import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBox } from "./search-box";
import { LanguageProvider } from "@/lib/i18n/language-context";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

function renderSearch() {
  return render(
    <LanguageProvider>
      <SearchBox variant="solid" />
    </LanguageProvider>,
  );
}

describe("SearchBox", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows only the search icon by default, no visible input", () => {
    renderSearch();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("expands into an input when the icon is clicked", async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("queries the search endpoint and links each result to its detail page", async () => {
    const user = userEvent.setup();
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        results: [
          { type: "missing_person", id: "p1", public_slug: "abc123", title: "Jane Doe", subtitle: "MG Road, Bengaluru", status: "missing" },
        ],
      }),
    );

    renderSearch();
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.type(screen.getByRole("searchbox"), "Jane");

    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    expect(screen.getByText("MG Road, Bengaluru")).toBeInTheDocument();
    // The result is a real link to the public share page, not just text.
    expect(screen.getByRole("link", { name: /Jane Doe/ })).toHaveAttribute(
      "href",
      "/missing-persons/share/abc123",
    );
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/search/?q=Jane");
  });

  it("closes and clears the query when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.type(screen.getByRole("searchbox"), "Jane");
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });
});
