import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CampaignDetail } from "./campaign-detail";
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
  organizer: "u2",
  organizer_name: "NGO Coordinator",
  title: "Marina Beach Cleanup",
  category: "cleanliness_drive" as const,
  description: "Bring gloves and a bottle of water.",
  city: "Chennai",
  venue: "Marina Beach",
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

function renderDetail() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <CampaignDetail campaignId="c1" />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("CampaignDetail", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders campaign details without requiring auth", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(mockCampaign));

    renderDetail();
    await waitFor(() => expect(screen.getByText("Marina Beach Cleanup")).toBeInTheDocument());
    expect(screen.getByText(/Bring gloves/)).toBeInTheDocument();
    expect(screen.getByText(/Log in to register/i)).toBeInTheDocument();
  });

  it("prefills and submits the registration form for a logged-in user", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    // CampaignDetail's own effect is unconditional and, as a child of
    // AuthProvider, fires before AuthProvider's /auth/me/ effect.
    fetchMock
      .mockResolvedValueOnce(jsonResponse(mockCampaign))
      .mockResolvedValueOnce(
        jsonResponse({
          id: "u1", full_name: "Asha Citizen", email: "asha@example.com", phone: "+919876500000",
          role: "citizen", is_verified: true, preferred_language: "en", profile_photo: null,
          date_joined: "2026-01-01",
        }),
      );

    renderDetail();
    await waitFor(() => expect(screen.getByLabelText("Full name")).toHaveValue("Asha Citizen"));
    expect(screen.getByLabelText("Phone")).toHaveValue("+919876500000");

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { id: "r1", campaign: "c1", user: "u1", full_name: "Asha Citizen", phone: "+919876500000", email: "", team_name: "", notes: "", status: "registered", created_at: "2026-07-01T00:00:00Z" },
        201,
      ),
    );

    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => expect(screen.getByText(/see you there/i)).toBeInTheDocument());
    expect(screen.getByText(/14 of 20 slot\(s\) left/)).toBeInTheDocument();
  });

  it("shows the API error message when registration is rejected", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(jsonResponse(mockCampaign))
      .mockResolvedValueOnce(
        jsonResponse({
          id: "u1", full_name: "Asha Citizen", email: "asha@example.com", phone: "+919876500000",
          role: "citizen", is_verified: true, preferred_language: "en", profile_photo: null,
          date_joined: "2026-01-01",
        }),
      );

    renderDetail();
    await waitFor(() => expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ detail: "You are already registered for this campaign.", code: "AlreadyRegisteredError" }, 409),
    );
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/already registered/i));
  });
});
