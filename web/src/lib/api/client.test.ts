import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError, extractErrorMessage } from "./client";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as Response;
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a JSON body with the correct content-type", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch("/things/", { method: "POST", body: { name: "test" } });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/things/"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "test" }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("attaches the Authorization header when a token is provided", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await apiFetch("/things/", { token: "abc123" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer abc123" }) }),
    );
  });

  it("throws ApiError with the response body on non-2xx", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "not found" }, 404));

    await expect(apiFetch("/missing/")).rejects.toMatchObject({ status: 404 });
  });

  it("does not set Content-Type for FormData bodies", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const form = new FormData();
    form.append("name", "test");
    await apiFetch("/things/", { method: "POST", body: form });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Content-Type"]).toBeUndefined();
    expect(options.body).toBe(form);
  });
});

describe("extractErrorMessage", () => {
  it("returns the message of a plain Error (e.g. network/geolocation failures)", () => {
    expect(extractErrorMessage(new Error("Could not get your location."))).toBe(
      "Could not get your location.",
    );
  });

  it("returns a generic message only for truly unknown thrown values", () => {
    expect(extractErrorMessage("a plain string was thrown")).toMatch(/went wrong/i);
  });

  it("returns the string detail field when present", () => {
    const error = new ApiError(400, { detail: "Invalid credentials." });
    expect(extractErrorMessage(error)).toBe("Invalid credentials.");
  });

  it("falls back to the first field error array", () => {
    const error = new ApiError(400, { phone: ["This field is required."] });
    expect(extractErrorMessage(error)).toBe("This field is required.");
  });
});
