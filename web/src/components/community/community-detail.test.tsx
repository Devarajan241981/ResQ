import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommunityDetail } from "./community-detail";
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

const baseCommunity = {
  id: "c1",
  owner: "u2",
  owner_name: "NGO Coordinator",
  name: "Flood Relief Updates",
  description: "Live updates on flood relief efforts.",
  banner_image: null,
  city: "Chennai",
  is_active: true,
  member_count: 3,
  is_member: false,
  created_at: "2026-07-01T00:00:00Z",
};

const emptyPosts = {
  count: 0,
  num_pages: 0,
  current_page: 1,
  next: null,
  previous: null,
  results: [] as Record<string, unknown>[],
};

function userOf(overrides: Record<string, unknown>) {
  return {
    id: "u1", full_name: "Asha Citizen", email: "a@x.com", phone: null, role: "citizen",
    is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
    ...overrides,
  };
}

// URL-keyed fetch so tests don't depend on request ordering (auth resolves first now).
function installFetch(opts: {
  me?: unknown;
  community?: typeof baseCommunity;
  posts?: typeof emptyPosts;
}) {
  let community = opts.community ?? baseCommunity;
  const posts = opts.posts ?? emptyPosts;
  const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
  fetchMock.mockImplementation((input: RequestInfo, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    if (url.includes("/auth/me/")) return Promise.resolve(jsonResponse(opts.me ?? {}, opts.me ? 200 : 401));
    if (url.match(/\/community\/c1\/join\/$/)) {
      community = { ...community, is_member: true, member_count: community.member_count + 1 };
      return Promise.resolve(jsonResponse(community));
    }
    if (url.match(/\/community\/c1\/leave\/$/)) {
      community = { ...community, is_member: false, member_count: community.member_count - 1 };
      return Promise.resolve(jsonResponse(community));
    }
    if (url.match(/\/community\/posts\/[\w-]+\/like\/$/)) {
      const updated = { ...posts.results[0], like_count: 1, has_liked: true };
      return Promise.resolve(jsonResponse(updated));
    }
    if (url.includes("/community/posts/") && method === "POST") {
      const created = { id: "p1", community: "c1", author: "u2", author_name: "NGO Coordinator", content: "Camp open at 6pm.", image: null, like_count: 0, has_liked: false, created_at: "2026-07-02T00:00:00Z" };
      return Promise.resolve(jsonResponse(created, 201));
    }
    if (url.includes("/community/posts/")) return Promise.resolve(jsonResponse(posts));
    if (url.includes("/community/c1/")) return Promise.resolve(jsonResponse(community));
    return Promise.resolve(jsonResponse({}));
  });
}

function renderDetail() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <CommunityDetail communityId="c1" />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("CommunityDetail", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders community details without requiring auth", async () => {
    installFetch({});
    renderDetail();
    await waitFor(() => expect(screen.getByText("Flood Relief Updates")).toBeInTheDocument());
    expect(screen.getByText(/Live updates on flood relief/)).toBeInTheDocument();
    expect(screen.getByText(/log in to join/i)).toBeInTheDocument();
  });

  it("lets a logged-in non-owner join and leave", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    installFetch({ me: userOf({ id: "u1", role: "citizen" }) });

    renderDetail();
    await waitFor(() => expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Join" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Leave" })).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Leave" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument());
  });

  it("shows a post composer only for the owner and posts successfully", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    installFetch({ me: userOf({ id: "u2", full_name: "NGO Coordinator", role: "ngo" }) });

    renderDetail();
    await waitFor(() => expect(screen.getByLabelText("Share an update with members")).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText("Share an update with members"), "Camp open at 6pm.");
    await userEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(screen.getByText("Camp open at 6pm.")).toBeInTheDocument());
  });

  it("lets a logged-in user like a post", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const post = {
      id: "p1", community: "c1", author: "u2", author_name: "NGO Coordinator", content: "Update",
      image: null, like_count: 0, has_liked: false, created_at: "2026-07-02T00:00:00Z",
    };
    installFetch({
      me: userOf({ id: "u1", role: "citizen" }),
      posts: { ...emptyPosts, count: 1, results: [post] },
    });

    renderDetail();
    await waitFor(() => expect(screen.getByText(/♥ 0/)).toBeInTheDocument());

    await userEvent.click(screen.getByText(/♥ 0/));
    await waitFor(() => expect(screen.getByText(/♥ 1/)).toBeInTheDocument());
  });
});
