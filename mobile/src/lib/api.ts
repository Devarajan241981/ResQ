import Constants from "expo-constants";

/**
 * Base URL of the ResQ Django API.
 *
 * A phone/emulator can't reach the laptop's "localhost", so set EXPO_PUBLIC_API_URL
 * to your machine's LAN IP when running on a device, e.g.
 *   EXPO_PUBLIC_API_URL=http://192.168.1.4:8020/api/v1 npx expo start
 * Android emulator can use http://10.0.2.2:8020/api/v1 to reach the host.
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  // Fall back to the Metro host IP (works for Expo Go on the same Wi‑Fi).
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.4:8081"
  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:8020/api/v1`;
  return "http://localhost:8020/api/v1";
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

/** Pull the first useful message out of DRF's varied error-body shapes. */
export function extractErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  }
  const body = error.body as { detail?: string | Record<string, unknown>; [k: string]: unknown } | undefined;
  if (!body) return error.message;
  if (typeof body.detail === "string") return body.detail;
  for (const value of Object.values(body)) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return error.message;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json() : undefined;
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
