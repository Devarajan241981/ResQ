import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryUpload } from "./gallery-upload";
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

function renderUpload(onUploaded = vi.fn()) {
  render(
    <LanguageProvider>
      <AuthProvider>
        <GalleryUpload onUploaded={onUploaded} />
      </AuthProvider>
    </LanguageProvider>,
  );
  return onUploaded;
}

describe("GalleryUpload", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is hidden for citizen accounts", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "Asha Citizen", email: "a@x.com", phone: null, role: "citizen",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderUpload();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Publish photo" })).not.toBeInTheDocument();
  });

  it("uploads multipart data for a verified NGO and fires onUploaded", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u2", full_name: "NGO Coordinator", email: "ngo@x.com", phone: null, role: "ngo",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    const onUploaded = renderUpload();
    await waitFor(() => expect(screen.getByRole("button", { name: "Publish photo" })).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "g1" }, 201));

    const file = new File(["img"], "camp.png", { type: "image/png" });
    await userEvent.upload(screen.getByLabelText("Photo"), file);
    await userEvent.type(screen.getByLabelText("Caption"), "Relief camp");
    await waitFor(() => expect(screen.getByRole("button", { name: "Publish photo" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "Publish photo" }));

    await waitFor(() => expect(onUploaded).toHaveBeenCalled());
    const [, options] = fetchMock.mock.calls.at(-1)!;
    const body = options.body as FormData;
    expect(body.get("caption")).toBe("Relief camp");
    expect((body.get("image") as File).name).toBe("camp.png");
  });
});
