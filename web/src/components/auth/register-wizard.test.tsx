import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterWizard } from "./register-wizard";
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

function renderWizard() {
  return render(
    <AuthProvider>
      <RegisterWizard />
    </AuthProvider>,
  );
}

async function fillBasicSteps(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Asha Kumar");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.type(screen.getByLabelText("Email"), "asha@example.com");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.type(screen.getByLabelText("Phone"), "+919876543210");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await user.type(screen.getByLabelText("Password"), "StrongPass123!");
  await user.click(screen.getByRole("button", { name: "Next" }));
}

describe("RegisterWizard", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows one question at a time and advances on Next", async () => {
    const user = userEvent.setup();
    renderWizard();

    expect(screen.getByText("What's your name?")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Full name"), "Asha Kumar");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("What's your email?")).toBeInTheDocument();
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
  });

  it("lets gender/blood group be picked by clicking a card, not typing", async () => {
    const user = userEvent.setup();
    renderWizard();
    await fillBasicSteps(user);

    expect(screen.getByText("How do you identify?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Female" }));

    // City step comes next
    expect(screen.getByText("Which city are you in?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Skip" }));

    expect(screen.getByText("What's your blood group?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "O+" }));

    // Review screen shows the picked values
    expect(screen.getByText("Review & create account")).toBeInTheDocument();
    expect(screen.getByText("female")).toBeInTheDocument();
    expect(screen.getByText("O+")).toBeInTheDocument();
    expect(screen.getByText("Not specified")).toBeInTheDocument(); // city was skipped
  });

  it("submits all collected answers including optional fields on final confirm", async () => {
    const user = userEvent.setup();
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          access: "tok",
          refresh: "reftok",
          user: {
            id: "1", full_name: "Asha Kumar", email: "asha@example.com", phone: "+919876543210",
            role: "citizen", is_verified: false, preferred_language: "en", profile_photo: null,
            gender: "female", city: "Bengaluru", date_joined: "2026-01-01",
          },
        },
        201,
      ),
    );

    renderWizard();
    await fillBasicSteps(user);
    await user.click(screen.getByRole("button", { name: "Female" }));
    await user.type(screen.getByLabelText("City"), "Bengaluru");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "O+" }));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      full_name: "Asha Kumar",
      email: "asha@example.com",
      phone: "+919876543210",
      gender: "female",
      city: "Bengaluru",
      blood_group: "O+",
    });
  });

  it("allows going back to a previous step", async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.type(screen.getByLabelText("Full name"), "Asha Kumar");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("What's your email?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByText("What's your name?")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("Asha Kumar");
  });

  it("shows the API error message if submission fails", async () => {
    const user = userEvent.setup();
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ phone: ["user with this phone already exists."] }, 400));

    renderWizard();
    await fillBasicSteps(user);
    await user.click(screen.getByRole("button", { name: "Skip" })); // gender
    await user.click(screen.getByRole("button", { name: "Skip" })); // city
    await user.click(screen.getByRole("button", { name: "Skip" })); // blood group
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("user with this phone already exists."),
    );
  });
});
