import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommunityForm } from "./community-form";
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
        <CommunityForm />
      </AuthProvider>
    </LanguageProvider>,
  );
}

describe("CommunityForm", () => {
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
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("submits the community as multipart data and redirects to its detail page", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        id: "u1", full_name: "NGO Coordinator", email: "ngo@x.com", phone: null, role: "ngo",
        is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01",
      }),
    );

    renderForm();
    await waitFor(() => expect(screen.getByLabelText("Name")).toBeInTheDocument());

    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "comm1" }, 201));

    await userEvent.type(screen.getByLabelText("Name"), "Flood Relief Updates");
    await userEvent.type(screen.getByLabelText("City"), "Chennai");
    await userEvent.click(screen.getByRole("button", { name: "Publish community" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/community/comm1"));

    const [, options] = fetchMock.mock.calls.at(-1)!;
    const body = options.body as FormData;
    expect(body.get("name")).toBe("Flood Relief Updates");
    expect(body.get("city")).toBe("Chennai");
  });
});
