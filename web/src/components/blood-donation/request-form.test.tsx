import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RequestForm } from "./request-form";
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
  id: "u1", full_name: "Asha", email: "a@x.com", phone: null, role: "citizen" as const,
  is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01T00:00:00Z",
};

function renderForm() {
  tokenStorage.setTokens("access-tok", "refresh-tok");
  const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
  fetchMock.mockResolvedValueOnce(jsonResponse(mockUser));
  return render(
    <AuthProvider>
      <RequestForm />
    </AuthProvider>,
  );
}

describe("RequestForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits the request as JSON and redirects on success", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByLabelText("Patient name")).toBeInTheDocument());

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "r1" }, 201));

    await userEvent.type(screen.getByLabelText("Patient name"), "John");
    await userEvent.type(screen.getByLabelText("City"), "Bengaluru");
    await userEvent.click(screen.getByRole("button", { name: "Post request" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/blood-donation"));

    const [, options] = fetchMock.mock.calls.at(-1)!;
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({ patient_name: "John", city: "Bengaluru", blood_group: "O+", urgency: "urgent" });
  });

  it("shows an error message on failure", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByLabelText("Patient name")).toBeInTheDocument());

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "Only verified accounts can post blood requests." }, 403));

    // Fill every required field so the browser's own HTML5 validation lets
    // the submit reach our handler — the point of this test is the server
    // rejecting an otherwise-valid submission, not a client-side validation gap.
    await userEvent.type(screen.getByLabelText("Patient name"), "John");
    await userEvent.type(screen.getByLabelText("City"), "Bengaluru");
    await userEvent.click(screen.getByRole("button", { name: "Post request" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/only verified accounts/i));
  });
});
