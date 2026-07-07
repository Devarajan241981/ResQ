export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

/** Extracts the first useful message out of DRF's varied error-body shapes. */
export function extractErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    // Non-API errors (network failures, geolocation denial, etc.) still carry
    // a useful message — only fall back to the generic string for truly
    // unknown throw values (e.g. a plain string or object was thrown).
    return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  }
  const body = error.body as
    | { detail?: string | Record<string, unknown>; [key: string]: unknown }
    | undefined;

  if (!body) return error.message;
  if (typeof body.detail === "string") return body.detail;

  for (const value of Object.values(body)) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  }
  return error.message;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
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

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}
