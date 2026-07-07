# ResQ India — Web App

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 frontend
consuming the Django REST API in `../backend`.

## What's implemented

Auth (email/password, phone OTP — Google Sign-In has no UI yet though the
backend supports it), dark mode, a language switcher (English + Hindi fully
translated, 8 more Indian languages selectable but falling back to English —
see `src/lib/i18n/translations.ts`), and the four fully-built backend
modules end-to-end:

- **Missing Persons** — authenticated list, report form (multipart, photos),
  unauthenticated public share page at `/missing-persons/share/[slug]`
- **SOS** — one-tap trigger with real browser geolocation, trusted contacts
  management, resolve/cancel
- **Blood Donation** — public request list, authenticated "I can donate"
  response, post-a-request form
- **Disaster Mode** — public active-event list, inline status reporting
  (mark safe / need rescue / food / water / medicine)

Everything else in `docs/ROADMAP.md` at the repo root (missing children/
elderly, lost pets, ambulance, NGOs, admin dashboard, etc.) has no frontend
yet — the backend API exists for some of it, this app just doesn't call it.

## Getting started

```bash
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev
```

Requires the Django backend running — see the root `README.md` for how to
start it (Docker or local), or `docker compose up` from `../backend`.

## Testing

```bash
npm test          # vitest run — one *.test.tsx file per component, co-located
npm run test:watch
npm run lint
npm run build
```

49 tests as of this writing, covering the API client, auth context (login/
OTP/token refresh-on-401/logout), theme/i18n, and every page's components
(navbar, forms, lists). Async Server Components aren't unit-tested (Vitest
can't render them — see Next.js's own testing docs) — page.tsx files that
`await params` are kept intentionally thin, delegating all real logic to a
tested Client Component.

Two real bugs were caught by combining this test suite with actual browser
verification against the live backend (not just mocked tests):
1. `extractErrorMessage` was swallowing non-API error messages (e.g.
   geolocation denial) behind a generic fallback — fixed in `lib/api/client.ts`.
2. The Django backend's exception handler was double-nesting DRF's own
   `{"detail": "..."}` error shape for non-business-logic exceptions
   (permission/auth errors), which surfaced as the literal string
   `"PermissionDenied"` in the UI instead of a real message — fixed in
   `backend/apps/common/exceptions.py`, with a regression test added.

## Structure

```
src/
  app/                    Routes (App Router) — thin page.tsx files
  components/<module>/    One folder per backend module, each component
                           co-located with its *.test.tsx
  lib/
    api/                  Fetch wrapper (client.ts), shared TS types (types.ts)
    auth/                 AuthProvider/useAuth, token storage, device-session
                           aware login/register/OTP/logout
    i18n/                 Language context + translation dictionaries
    theme/                Dark mode context
    geolocation.ts         Thin wrapper around navigator.geolocation
```

## Known gaps (intentional, tracked)

- No httpOnly-cookie token storage — access/refresh tokens live in
  `localStorage` via `lib/auth/token-storage.ts`. Fine for this stage; a
  production hardening pass would proxy auth through Next.js Route
  Handlers setting httpOnly cookies instead.
- `next/image` uses `unoptimized` for backend-served media (user photos,
  QR codes) since the media host varies between dev (localhost) and prod
  (S3), rather than maintaining `remotePatterns` for both.
- Accessibility: forms use labeled inputs and `role="alert"` for errors
  throughout, but no dedicated a11y audit (axe, Lighthouse) has been run yet.
