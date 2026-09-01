import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommunityList, CommunityListHeader } from "./community-list";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import * as tokenStorage from "@/lib/auth/token-storage";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

const mockCommunity = {
  id: "c1",
  owner: "u2",
  owner_name: "NGO Coordinator",
  name: "Flood Relief Updates",
  description: "",
  banner_image: null,
  city: "Chennai",
  is_active: true,
  member_count: 3,
  is_member: false,
  created_at: "2026-07-01T00:00:00Z",
};

function renderList() {
  return render(
    <LanguageProvider>
      <CommunityList />
    </LanguageProvider>,
  );
}

function renderHeader() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <CommunityListHeader />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("CommunityList", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an empty state when there are no communities", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 0, num_pages: 0, current_page: 1, next: null, previous: null, results: [] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText(/no communities/i)).toBeInTheDocument());
  });

  it("renders a community card linking to its detail page", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockCommunity] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText("Flood Relief Updates")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "View & join" })).toHaveAttribute("href", "/community/c1");
  });
});

describe("CommunityListHeader", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not show a start-community link when logged out", () => {
    renderHeader();
    expect(screen.queryByRole("link", { name: "Start a community" })).not.toBeInTheDocument();
  });

  it("shows a start-community link for a verified NGO account", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "NGO Coordinator", email: "ngo@x.com", phone: null, role: "ngo",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderHeader();
    await waitFor(() => expect(screen.getByRole("link", { name: "Start a community" })).toBeInTheDocument());
  });
});
