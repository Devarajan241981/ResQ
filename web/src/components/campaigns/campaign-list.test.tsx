import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CampaignList, CampaignListHeader } from "./campaign-list";
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

const mockCampaign = {
  id: "c1",
  organizer: "u1",
  organizer_name: "NGO Coordinator",
  title: "Marina Beach Cleanup",
  category: "cleanliness_drive" as const,
  description: "",
  city: "Chennai",
  venue: "",
  banner_image: null,
  capacity: 20,
  registered_count: 5,
  available_slots: 15,
  starts_at: "2026-08-01T10:00:00Z",
  ends_at: null,
  registration_deadline: null,
  status: "published" as const,
  latitude: null,
  longitude: null,
  created_at: "2026-07-01T00:00:00Z",
};

function renderList() {
  return render(
    <LanguageProvider>
      <CampaignList />
    </LanguageProvider>,
  );
}

function renderHeader() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <CampaignListHeader />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("CampaignList", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an empty state when there are no campaigns", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 0, num_pages: 0, current_page: 1, next: null, previous: null, results: [] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText(/no campaigns are open/i)).toBeInTheDocument());
  });

  it("renders a campaign card with slots remaining and links to its detail page", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 1, num_pages: 1, current_page: 1, next: null, previous: null, results: [mockCampaign] }),
    );

    renderList();
    await waitFor(() => expect(screen.getByText("Marina Beach Cleanup")).toBeInTheDocument());
    expect(screen.getByText(/15 slot\(s\) left/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View & register" })).toHaveAttribute("href", "/campaigns/c1");
  });
});

describe("CampaignListHeader", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not show a start-campaign link when logged out", () => {
    renderHeader();
    expect(screen.queryByRole("link", { name: "Start a campaign" })).not.toBeInTheDocument();
  });

  it("shows a start-campaign link for a verified NGO account", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "NGO Coordinator", email: "ngo@x.com", phone: null, role: "ngo",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderHeader();
    await waitFor(() => expect(screen.getByRole("link", { name: "Start a campaign" })).toBeInTheDocument());
  });
});
