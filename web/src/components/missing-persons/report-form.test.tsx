import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportForm } from "./report-form";
import { AuthProvider } from "@/lib/auth/auth-context";
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

function renderForm() {
  // AuthProvider mounts with a token already set, so it always fires a
  // /auth/me/ request first — queue that response before the test's own.
  const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
  fetchMock.mockResolvedValueOnce(jsonResponse(mockUser));

  return render(
    <AuthProvider>
      <ReportForm />
    </AuthProvider>,
  );
}

describe("ReportForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    tokenStorage.setTokens("access-tok", "refresh-tok");
    pushMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits the form as multipart data and redirects to the public share page", async () => {
    renderForm();
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ public_slug: "xyz789" }, 201));

    await userEvent.type(screen.getByLabelText("Name"), "Jane Doe");
    await userEvent.type(screen.getByLabelText("Age"), "30");
    await userEvent.type(screen.getByLabelText("Last seen location"), "MG Road, Bengaluru");
    await userEvent.type(screen.getByLabelText("Last seen date & time"), "2026-07-01T10:00");
    await userEvent.type(screen.getByLabelText("Languages spoken (comma-separated)"), "Hindi, English");
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/missing-persons/share/xyz789"));

    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toContain("/missing-persons/");
    const body = options.body as FormData;
    expect(body.get("name")).toBe("Jane Doe");
    expect(body.get("age")).toBe("30");
    expect(body.getAll("languages_spoken")).toEqual(["Hindi", "English"]);
  });

  it("shows the API error message on failure", async () => {
    renderForm();
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "This action is not permitted for the current state." }, 403));

    await userEvent.type(screen.getByLabelText("Name"), "Jane Doe");
    await userEvent.type(screen.getByLabelText("Age"), "30");
    await userEvent.type(screen.getByLabelText("Last seen location"), "MG Road");
    await userEvent.type(screen.getByLabelText("Last seen date & time"), "2026-07-01T10:00");
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/not permitted/i));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
