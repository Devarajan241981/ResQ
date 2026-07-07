import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventCard } from "./event-card";
import { AuthProvider } from "@/lib/auth/auth-context";
import * as tokenStorage from "@/lib/auth/token-storage";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

const mockEvent = {
  id: "e1",
  name: "Bengaluru Flood",
  disaster_type: "flood" as const,
  description: "",
  affected_area: "Koramangala",
  radius_km: "10",
  status: "active" as const,
  latitude: null,
  longitude: null,
  started_at: "2026-01-01T00:00:00Z",
  ended_at: null,
  open_needs_count: 3,
  created_at: "2026-01-01T00:00:00Z",
};

function renderCard() {
  return render(
    <AuthProvider>
      <EventCard event={mockEvent} />
    </AuthProvider>,
  );
}

describe("EventCard", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not show the status-report form when logged out", async () => {
    renderCard();
    await waitFor(() => expect(screen.getByText(/Bengaluru Flood/)).toBeInTheDocument());
    expect(screen.queryByLabelText(`Status for ${mockEvent.name}`)).not.toBeInTheDocument();
  });

  it("submits a status report and shows a confirmation", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "Asha", email: "a@x.com", phone: null, role: "citizen",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderCard();
    await waitFor(() => expect(screen.getByLabelText(`Status for ${mockEvent.name}`)).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: "sr1", event: "e1", user: "u1", user_name: "Asha", need_type: "need_water", notes: "", latitude: null, longitude: null, is_resolved: false, created_at: "2026-01-01T00:00:00Z" }, 201),
    );

    await userEvent.selectOptions(screen.getByLabelText(`Status for ${mockEvent.name}`), "need_water");
    await userEvent.click(screen.getByRole("button", { name: "Report status" }));

    await waitFor(() => expect(screen.getByText(/thanks/i)).toBeInTheDocument());

    const [, options] = fetchMock.mock.calls.at(-1)!;
    expect(JSON.parse(options.body)).toMatchObject({ event: "e1", need_type: "need_water" });
  });
});
