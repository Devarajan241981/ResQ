import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";
import { AuthProvider } from "@/lib/auth/auth-context";

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

function renderLoginForm() {
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to the email tab", () => {
    renderLoginForm();
    expect(screen.getByRole("tab", { name: "Email" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("logs in with email/password and redirects home", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        access: "tok",
        refresh: "reftok",
        user: { id: "1", full_name: "Asha", email: "a@x.com", phone: null, role: "citizen", is_verified: true, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01" },
      }),
    );

    renderLoginForm();
    await userEvent.type(screen.getByLabelText("Email"), "a@x.com");
    await userEvent.type(screen.getByLabelText("Password"), "StrongPass123!");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("shows the API error message on failed login", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "Invalid credentials." }, 401));

    renderLoginForm();
    await userEvent.type(screen.getByLabelText("Email"), "a@x.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials."));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("switches to the phone OTP tab and requests an OTP", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "OTP sent." }));

    renderLoginForm();
    await userEvent.click(screen.getByRole("tab", { name: "Phone OTP" }));
    await userEvent.type(screen.getByLabelText("Phone number"), "+919876543210");
    await userEvent.click(screen.getByRole("button", { name: "Send OTP" }));

    await waitFor(() => expect(screen.getByLabelText("OTP code")).toBeInTheDocument());
  });
});
