import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./register-form";
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

function renderRegisterForm() {
  return render(
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>,
  );
}

describe("RegisterForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits all fields and redirects home on success", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        access: "tok",
        refresh: "reftok",
        user: { id: "1", full_name: "New User", email: "n@x.com", phone: "+919876543210", role: "citizen", is_verified: false, preferred_language: "en", profile_photo: null, date_joined: "2026-01-01" },
      }),
    );

    renderRegisterForm();
    await userEvent.type(screen.getByLabelText("Full name"), "New User");
    await userEvent.type(screen.getByLabelText("Email"), "n@x.com");
    await userEvent.type(screen.getByLabelText("Phone"), "+919876543210");
    await userEvent.type(screen.getByLabelText("Password"), "StrongPass123!");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toMatchObject({
      full_name: "New User",
      email: "n@x.com",
      phone: "+919876543210",
    });
  });

  it("shows a field-level error returned by the API", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ phone: ["user with this phone already exists."] }, 400));

    renderRegisterForm();
    await userEvent.type(screen.getByLabelText("Full name"), "New User");
    await userEvent.type(screen.getByLabelText("Email"), "n@x.com");
    await userEvent.type(screen.getByLabelText("Phone"), "+919876543210");
    await userEvent.type(screen.getByLabelText("Password"), "StrongPass123!");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("user with this phone already exists."),
    );
  });
});
