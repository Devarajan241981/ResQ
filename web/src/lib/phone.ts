/**
 * Best-effort phone normalization for the signup wizard. The backend (via
 * django-phonenumber-field) is the real source of truth for validity, but
 * without this the wizard let users type "919663397727" (no leading "+")
 * all the way to the final "Create account" step before failing — this
 * catches that at the phone step instead, and auto-fixes the common case
 * (10-digit Indian mobile number, or missing "+" with a country code).
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim().replace(/[\s\-()]/g, "");
  if (!trimmed) return null;

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1);
    return /^\d{8,15}$/.test(digits) ? trimmed : null;
  }

  if (/^\d{10}$/.test(trimmed)) {
    return `+91${trimmed}`; // bare 10-digit number: assume Indian mobile
  }

  if (/^\d{11,15}$/.test(trimmed)) {
    return `+${trimmed}`; // digits with a country code but missing "+"
  }

  return null;
}
