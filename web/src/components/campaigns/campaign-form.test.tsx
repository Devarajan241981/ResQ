import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CampaignForm } from "./campaign-form";
import { AuthProvider } from "@/lib/auth/auth-context";
import { LanguageProvider } from "@/lib/i18n/language-context";
import * as tokenStorage from "@/lib/auth/token-storage";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

function renderForm() {
  return render(
    <LanguageProvider>
      <AuthProvider>
        <CampaignForm />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("CampaignForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("blocks a citizen account from seeing the form", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "Asha Citizen", email: "a@x.com", phone: null, role: "citizen",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderForm();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/only verified ngo or admin accounts/i),
    );
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });

  it("submits the campaign and redirects to its detail page", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "NGO Coordinator", email: "ngo@x.com", phone: null, role: "ngo",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderForm();
    await waitFor(() => expect(screen.getByLabelText("Title")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "c1" }, 201));

    await userEvent.type(screen.getByLabelText("Title"), "Marina Beach Cleanup");
    await userEvent.type(screen.getByLabelText("City"), "Chennai");
    await userEvent.type(screen.getByLabelText("Starts at"), "2026-08-01T10:00");
    await userEvent.click(screen.getByRole("button", { name: "Publish campaign" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/campaigns/c1"));

    const [, options] = fetchMock.mock.calls.at(-1)!;
    const body = options.body as FormData;
    expect(body.get("title")).toBe("Marina Beach Cleanup");
    expect(body.get("city")).toBe("Chennai");
    expect(body.get("category")).toBe("awareness");
  });

  it("shows the API error message on failure", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "NGO Coordinator", email: "ngo@x.com", phone: null, role: "ngo",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderForm();
    await waitFor(() => expect(screen.getByLabelText("Title")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "This action is not permitted for the current state." }, 403));

    await userEvent.type(screen.getByLabelText("Title"), "Marina Beach Cleanup");
    await userEvent.type(screen.getByLabelText("City"), "Chennai");
    await userEvent.type(screen.getByLabelText("Starts at"), "2026-08-01T10:00");
    await userEvent.click(screen.getByRole("button", { name: "Publish campaign" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/not permitted/i));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
