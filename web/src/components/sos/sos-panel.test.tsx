import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SosPanel } from "./sos-panel";
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

const mockUser = {
  id: "u1",
  full_name: "Asha Citizen",
  email: "asha@example.com",
  phone: null,
  role: "citizen" as const,
  is_verified: true,
  preferred_language: "en",
  profile_photo: null,
  date_joined: "2026-01-01T00:00:00Z",
};

const emptyAlertList = { count: 0, num_pages: 0, current_page: 1, next: null, previous: null, results: [] };

function renderPanel() {
  tokenStorage.setTokens("access-tok", "refresh-tok");
  const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
  fetchMock.mockResolvedValueOnce(jsonResponse(mockUser)); // /auth/me/
  fetchMock.mockResolvedValueOnce(jsonResponse(emptyAlertList)); // initial /sos/alerts/ list
  return render(
    <AuthProvider>
      <SosPanel />
    </AuthProvider>,
  );
}

describe("SosPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
    Object.defineProperty(global.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) =>
          success({ coords: { latitude: 12.9716, longitude: 77.5946 } }),
        ),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the SOS button when there is no active alert", async () => {
    renderPanel();
    await waitFor(() => expect(screen.getByRole("button", { name: /trigger sos/i })).toBeInTheDocument());
  });

  it("triggers an SOS alert with the current location and shows the active state", async () => {
    renderPanel();
    await waitFor(() => expect(screen.getByRole("button", { name: /trigger sos/i })).toBeInTheDocument());

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: "a1", status: "active", notes: "", media: null, latitude: "12.9716", longitude: "77.5946", pings: [], resolved_at: null, created_at: "2026-01-01T00:00:00Z" }, 201),
    );

    await userEvent.click(screen.getByRole("button", { name: /trigger sos/i }));

    await waitFor(() => expect(screen.getByText("SOS alert is active")).toBeInTheDocument());

    const lastCall = fetchMock.mock.calls.at(-1);
    expect(JSON.parse(lastCall![1].body)).toMatchObject({ latitude: 12.9716, longitude: 77.5946 });
  });

  it("resolving the active alert returns to the trigger button", async () => {
    renderPanel();
    await waitFor(() => expect(screen.getByRole("button", { name: /trigger sos/i })).toBeInTheDocument());

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: "a1", status: "active", notes: "", media: null, latitude: "12.9716", longitude: "77.5946", pings: [], resolved_at: null, created_at: "2026-01-01T00:00:00Z" }, 201),
    );
    await userEvent.click(screen.getByRole("button", { name: /trigger sos/i }));
    await waitFor(() => expect(screen.getByText("SOS alert is active")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: "a1", status: "resolved", notes: "", media: null, latitude: "12.9716", longitude: "77.5946", pings: [], resolved_at: "2026-01-01T01:00:00Z", created_at: "2026-01-01T00:00:00Z" }),
    );
    await userEvent.click(screen.getByRole("button", { name: /i'm safe now/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /trigger sos/i })).toBeInTheDocument());
  });

  it("shows an error if geolocation is denied", async () => {
    Object.defineProperty(global.navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: vi.fn((_success, error) => error(new Error("denied"))) },
    });

    renderPanel();
    await waitFor(() => expect(screen.getByRole("button", { name: /trigger sos/i })).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /trigger sos/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/location/i));
  });
});
