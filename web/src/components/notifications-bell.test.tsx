import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsBell } from "./notifications-bell";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import * as tokenStorage from "@/lib/auth/token-storage";

// The bell navigates on click — stub the app router so the invariant passes.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

const mockMe = {
  id: "u1", full_name: "Asha Citizen", email: "a@x.com", phone: null, role: "citizen",
  is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
};

const page = (results: unknown[]) => ({ count: results.length, num_pages: 1, current_page: 1, next: null, previous: null, results });

function renderBell() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <NotificationsBell variant="solid" />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("NotificationsBell", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders nothing when logged out", () => {
    renderBell();
    expect(screen.queryByRole("button", { name: "Notifications" })).not.toBeInTheDocument();
  });

  it("shows an unread badge and lists notifications in the dropdown", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const notif = {
      id: "n1", notification_type: "missing_person_alert", channel: "in_app",
      title: "Possible sighting of Ravi", body: "KR Market", data: {}, is_read: false,
      sent_at: null, created_at: "2026-07-09T00:00:00Z",
    };
    // Bell's own effect fires alongside AuthProvider's /auth/me/ — order can
    // vary, so answer both paths explicitly.
    fetchMock.mockImplementation((input: RequestInfo) => {
      const url = String(input);
      if (url.includes("/auth/me/")) return Promise.resolve(jsonResponse(mockMe));
      return Promise.resolve(jsonResponse(page([notif])));
    });

    renderBell();
    await waitFor(() => expect(screen.getByTestId("notif-badge")).toHaveTextContent("1"));

    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Possible sighting of Ravi")).toBeInTheDocument();
    expect(screen.getByText("KR Market")).toBeInTheDocument();
  });

  it("filters notifications by category chip", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const sighting = {
      id: "n1", notification_type: "missing_person_alert", channel: "in_app", title: "Sighting of Ravi",
      body: "KR Market", data: {}, is_read: false, sent_at: null, created_at: "2026-07-09T00:00:00Z",
    };
    const blood = {
      id: "n2", notification_type: "blood_request", channel: "in_app", title: "O+ needed",
      body: "Bengaluru", data: {}, is_read: false, sent_at: null, created_at: "2026-07-09T01:00:00Z",
    };
    fetchMock.mockImplementation((input: RequestInfo) => {
      const url = String(input);
      if (url.includes("/auth/me/")) return Promise.resolve(jsonResponse(mockMe));
      return Promise.resolve(jsonResponse(page([sighting, blood])));
    });

    renderBell();
    await waitFor(() => expect(screen.getByTestId("notif-badge")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));

    // Both visible under "All".
    expect(screen.getByText("Sighting of Ravi")).toBeInTheDocument();
    expect(screen.getByText("O+ needed")).toBeInTheDocument();

    // Filtering to Blood hides the missing-person alert.
    await userEvent.click(screen.getByRole("button", { name: "Blood" }));
    expect(screen.queryByText("Sighting of Ravi")).not.toBeInTheDocument();
    expect(screen.getByText("O+ needed")).toBeInTheDocument();
  });

  it("marks all read and clears the badge", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const notif = {
      id: "n1", notification_type: "system", channel: "in_app", title: "Welcome", body: "",
      data: {}, is_read: false, sent_at: null, created_at: "2026-07-09T00:00:00Z",
    };
    fetchMock.mockImplementation((input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/me/")) return Promise.resolve(jsonResponse(mockMe));
      if (url.includes("mark-all-read")) return Promise.resolve(jsonResponse({ detail: "ok" }));
      if (init?.method === undefined || init.method === "GET") return Promise.resolve(jsonResponse(page([notif])));
      return Promise.resolve(jsonResponse({}));
    });

    renderBell();
    await waitFor(() => expect(screen.getByTestId("notif-badge")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    await userEvent.click(screen.getByText("Mark all read"));
    await waitFor(() => expect(screen.queryByTestId("notif-badge")).not.toBeInTheDocument());
  });
});
