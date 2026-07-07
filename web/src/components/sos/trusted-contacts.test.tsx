import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TrustedContacts } from "./trusted-contacts";
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

function renderContacts(initialContacts: unknown[] = []) {
  tokenStorage.setTokens("access-tok", "refresh-tok");
  const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
  fetchMock.mockResolvedValueOnce(jsonResponse(mockUser));
  fetchMock.mockResolvedValueOnce(
    jsonResponse({ count: initialContacts.length, num_pages: 1, current_page: 1, next: null, previous: null, results: initialContacts }),
  );
  return render(
    <AuthProvider>
      <TrustedContacts />
    </AuthProvider>,
  );
}

describe("TrustedContacts", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an empty state with no contacts", async () => {
    renderContacts([]);
    await waitFor(() => expect(screen.getByText("No trusted contacts yet.")).toBeInTheDocument());
  });

  it("lists existing contacts", async () => {
    renderContacts([{ id: "c1", name: "Mom", phone: "+919800000099", relationship: "mother" }]);
    await waitFor(() => expect(screen.getByText(/Mom/)).toBeInTheDocument());
    expect(screen.getByText(/\+919800000099/)).toBeInTheDocument();
  });

  it("adds a new contact and appends it to the list", async () => {
    renderContacts([]);
    await waitFor(() => expect(screen.getByText("No trusted contacts yet.")).toBeInTheDocument());

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: "c2", name: "Dad", phone: "+919800000098", relationship: "father" }, 201),
    );

    await userEvent.type(screen.getByLabelText("Contact name"), "Dad");
    await userEvent.type(screen.getByLabelText("Contact phone"), "+919800000098");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(screen.getByText(/Dad/)).toBeInTheDocument());
  });
});
