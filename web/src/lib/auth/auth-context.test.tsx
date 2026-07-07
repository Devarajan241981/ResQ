import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth-context";
import * as tokenStorage from "./token-storage";

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
  phone: "+919800000003",
  role: "citizen" as const,
  is_verified: true,
  preferred_language: "en",
  profile_photo: null,
  date_joined: "2026-01-01T00:00:00Z",
};

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="status">{auth.isLoading ? "loading" : auth.isAuthenticated ? "in" : "out"}</span>
      <span data-testid="user-name">{auth.user?.full_name ?? ""}</span>
      <button onClick={() => auth.loginWithEmail("asha@example.com", "StrongPass123!")}>login</button>
      <button onClick={() => auth.logout()}>logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts logged out when there is no stored token", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("out"));
  });

  it("logs in and stores tokens", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ access: "access-tok", refresh: "refresh-tok", user: mockUser }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("out"));

    await act(async () => {
      await userEvent.click(screen.getByText("login"));
    });

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("in"));
    expect(screen.getByTestId("user-name")).toHaveTextContent("Asha Citizen");
    expect(tokenStorage.getAccessToken()).toBe("access-tok");
  });

  it("loads the current user on mount when a token already exists", async () => {
    tokenStorage.setTokens("existing-access", "existing-refresh");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("in"));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me/"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer existing-access" }) }),
    );
  });

  it("refreshes the access token once on a 401 and retries the request", async () => {
    tokenStorage.setTokens("expired-access", "valid-refresh");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ detail: "token expired" }, 401))
      .mockResolvedValueOnce(jsonResponse({ access: "new-access" }))
      .mockResolvedValueOnce(jsonResponse(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("in"));
    expect(tokenStorage.getAccessToken()).toBe("new-access");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("logout clears user and tokens", async () => {
    tokenStorage.setTokens("access-tok", "refresh-tok");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse(mockUser));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("in"));

    await act(async () => {
      await userEvent.click(screen.getByText("logout"));
    });

    expect(screen.getByTestId("status")).toHaveTextContent("out");
    expect(tokenStorage.getAccessToken()).toBeNull();
  });
});
