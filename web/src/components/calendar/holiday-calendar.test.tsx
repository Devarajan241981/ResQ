import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HolidayCalendar } from "./holiday-calendar";
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

const citizen = {
  id: "u1", full_name: "Asha Citizen", email: "a@x.com", phone: null, role: "citizen",
  is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
};

const campEvent = {
  id: "ev1", created_by: "u2", creator_name: "Seva Trust", title: "Blood donation camp",
  description: "Walk-in donors welcome.", category: "blood_drive", event_date: "2026-07-15",
  start_time: "10:00:00", location: "Town Hall", city: "Bengaluru", is_public: true,
  rsvp_count: 3, has_rsvped: false, created_at: "2026-07-01T00:00:00Z",
};

const eventsPage = (results: unknown[]) => ({ count: results.length, num_pages: 1, current_page: 1, next: null, previous: null, results });

function renderCalendar() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <HolidayCalendar />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("HolidayCalendar", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders holidays inside the month grid", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(jsonResponse(eventsPage([])));

    renderCalendar();
    // Navigate to January to find Republic Day (Jan 26).
    const prev = screen.getByRole("button", { name: "Previous month" });
    for (let i = 0; i < 12 && !screen.queryByRole("heading", { name: /January 2026/i }); i += 1) {
      await userEvent.click(prev);
    }
    expect(screen.getAllByText("Republic Day").length).toBeGreaterThan(0);
  });

  it("shows an event in the day agenda and prompts login when logged out", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(jsonResponse(eventsPage([campEvent])));

    renderCalendar();
    // Default month is today's (July 2026); click day 15 which has the camp event.
    await waitFor(() => expect(screen.getByText("15")).toBeInTheDocument());
    await userEvent.click(screen.getByText("15"));

    // Title shows both in the grid cell chip and the agenda panel.
    expect(screen.getAllByText("Blood donation camp").length).toBeGreaterThan(0);
    expect(screen.getByText(/3 attending/)).toBeInTheDocument();
    expect(screen.getByText(/log in to rsvp/i)).toBeInTheDocument();
  });

  it("lets a logged-in user RSVP to an event", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/me/")) return Promise.resolve(jsonResponse(citizen));
      if (url.includes("/rsvp/") && init?.method === "POST") {
        return Promise.resolve(jsonResponse({ ...campEvent, has_rsvped: true, rsvp_count: 4 }));
      }
      return Promise.resolve(jsonResponse(eventsPage([campEvent])));
    });

    renderCalendar();
    await waitFor(() => expect(screen.getByText("15")).toBeInTheDocument());
    await userEvent.click(screen.getByText("15"));

    const rsvpBtn = await screen.findByRole("button", { name: "Add to my calendar" });
    await userEvent.click(rsvpBtn);
    await waitFor(() => expect(screen.getByRole("button", { name: "Going ✓" })).toBeInTheDocument());
  });
});
