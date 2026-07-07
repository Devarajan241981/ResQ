# ResQ India — Build Roadmap & Status

This tracks what's actually implemented vs. scaffolded vs. not started, so
nobody has to guess from the code alone. "Scaffolded" means: real Django
model(s) with correct fields/relationships and migrations applied, but no
API layer (serializers/views/urls) yet — the data layer is real, the HTTP
surface isn't.

## Backend modules

| Module | Status | Notes |
|---|---|---|
| Accounts / Auth | **Full** | Custom User (UUID PK, roles), JWT + refresh rotation + blacklist, phone OTP, Google Sign-In, device sessions (list/revoke), welcome-notification signal |
| Missing Person | **Full** | Photos, QR code, public share link, sighting timeline, status workflow, rule-based risk scoring, duplicate detection, DDD layering (selectors/services/validators/signals) |
| SOS | **Full** | One-tap alert, trusted contacts, live location via Django Channels WebSocket, nearby-volunteer + trusted-contact notification |
| Blood Donation | **Full** | Donor profiles, emergency requests, nearby-donor geo search, response/fulfill/cancel workflow |
| Disaster Mode | **Full** | Disaster events, status reports (mark safe / need rescue / food / water / medicine), volunteer assignment, WebSocket broadcast, auto-alert on NEED_RESCUE |
| Hospitals | **Full** (supporting) | Directory + nearby search; hospital-side dashboard features (departments, live availability, doctor directory) not yet built |
| Volunteers | **Full** (supporting) | Profile, skills, verification, nearby search; ratings/badges not yet built |
| Shelters | **Full** (supporting) | Directory + nearby search + capacity tracking |
| Notifications | **Full** (supporting) | In-app model + Celery dispatch; push (FCM) and SMS/email provider wiring are stubbed behind `apps.common.sms` / `settings.SMS_PROVIDER` |
| Police | **Full** (supporting) | Station directory + nearby search + pluggable case-forwarding gateway (no government API hardcoded, by design) |
| Maps | **Full** (supporting) | Server-side OpenRouteService geocode/route proxy (API key never reaches the client) |
| Search | **Full** (supporting) | Pluggable backend interface; Postgres `icontains` is the working default, swap in Elasticsearch/OpenSearch later without touching callers |
| Analytics | **Full** (supporting) | One aggregate endpoint for admin-dashboard counts; expand per-dashboard-widget as the frontend needs land |
| Audit Logs | **Full** (supporting) | Request-level audit trail via middleware, read-only admin API |
| Media | **Full** (supporting) | Upload validation (size/type/decodability) + S3 presigned-upload issuance |
| Missing Children | Scaffolded | Model has extra-verification + priority-alert fields; API, school-integration hook not built |
| Missing Elderly | Scaffolded | Model has dementia/Alzheimer's/medical-history + emergency-button fields; API not built |
| Lost Pets | Scaffolded | Model + photo model; nearby-shelter/vet response workflow not built |
| Ambulance | Scaffolded | Request model; provider-notification workflow not built |
| Organizations | Scaffolded | Generic partner-org registry; not yet linked from NGO/Hospital profiles |
| NGOs | Scaffolded | Profile model; dashboard (accept/update/close cases) not built |
| AI Matching | Interfaces only | Face recognition / duplicate-detection / translation are ABCs with a no-op default (`NotConfiguredEngine`), by design — see the "AI Features" section below |

## Native performance engine

`backend/native_engine` — C library (CMake build) for geo math, image
resize/encode (via libjpeg-turbo/libpng), QR batch rendering (libqrencode,
thread-pooled), and OpenSSL crypto wrappers. Bound into Django via ctypes
(`apps/common/native.py`) with automatic pure-Python fallback. See its own
README for honest benchmark numbers (geo functions: 2-4x faster; crypto
wrapper: intentionally *not* used for routine hashing since Python's
`hashlib` already wraps OpenSSL directly).

## AI features (per the original spec)

Explicitly **not implemented yet**, by design — `apps/ai_matching` defines
the interfaces (`FaceRecognitionEngine`, `ImageEnhancementEngine`,
`DuplicateDetectionEngine`, `TranslationEngine`) so a real model can be
dropped in later without changing any caller. What exists today as a
non-ML stand-in:
- Risk scoring: rule-based heuristic in `missing_persons/services.py` (missing photos/contacts, inconsistent dates, etc. add points) — not a trained classifier.
- Duplicate detection: exact name+age match within a time window (`missing_persons/selectors.py`) — not fuzzy/embedding-based yet.
- Regional language translation, image enhancement, automatic report summarization: interfaces defined, no backend wired.

## Platform surfaces not yet started

- **Next.js web application** (citizen-facing + family dashboard)
- **Flutter mobile app** (Android/iOS)
- **Admin Dashboard** (separate frontend consuming the existing Django admin + `/api/v1/analytics/`, `/api/v1/audit-logs/`)
- **Super Admin Dashboard**

These were deliberately sequenced after the backend per the "backend-first"
build order — the API surface, auth, and data model needed to be solid
before building three more frontends against it.

## Infra / DevOps

| Item | Status |
|---|---|
| Docker (multi-stage, builds native_engine) | Done, verified (image builds, full compose stack boots) |
| docker-compose (Postgres, Redis, Daphne, Celery worker + beat) | Done, verified end-to-end |
| CI (GitHub Actions: lint, native build, pytest w/ real Postgres+Redis, Docker build) | Done |
| Seed data command | Done, idempotent |
| Swagger/OpenAPI (drf-spectacular) | Done, 0 schema errors |
| Postman collection | Not yet generated — schema is at `/api/schema/`, can be imported directly into Postman as an OpenAPI 3 source |
| Prometheus / Grafana | Not yet wired — Sentry is wired (`SENTRY_DSN` setting) |
| Cursor pagination | Not yet added (page-number pagination is in place; cursor pagination is a drop-in `CursorPagination` swap in `apps/common/pagination.py` when a feed-style endpoint needs it) |
