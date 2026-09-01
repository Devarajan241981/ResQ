import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventForm } from "./event-form";
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

describe("EventForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits a new event as JSON and calls onCreated", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/auth/me/")) {
        return Promise.resolve(
          jsonResponse({
            id: "u2", full_name: "NGO Coordinator", email: "ngo@x.com", phone: null, role: "ngo",
            is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
          }),
        );
      }
      if (url.includes("/events/events/") && init?.method === "POST") {
        return Promise.resolve(jsonResponse({ id: "ev1", event_date: "2026-07-20", title: "Relief drive" }, 201));
      }
      return Promise.resolve(jsonResponse({}));
    });

    const onCreated = vi.fn();
    render(
      <LanguageProvider>
        <AuthProvider>
          <EventForm defaultDate="2026-07-20" onClose={vi.fn()} onCreated={onCreated} />
        </AuthProvider>
      </LanguageProvider>,
    );

    await userEvent.type(screen.getByLabelText("Title"), "Relief drive");
    await userEvent.type(screen.getByLabelText("City"), "Chennai");
    await userEvent.click(screen.getByRole("button", { name: "Publish event" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    const postCall = fetchMock.mock.calls.find((c: unknown[]) => (c[1] as RequestInit)?.method === "POST");
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body.title).toBe("Relief drive");
    expect(body.event_date).toBe("2026-07-20");
    expect(body.city).toBe("Chennai");
  });
});
