# Production Deployment Guide

## Prerequisites

- A container runtime (the platform is built and tested as Docker images)
- Managed Postgres 16 (RDS, Cloud SQL, Neon, etc.) — enable automated backups
- Managed Redis 7 (used as: Celery broker, Django cache, Channels layer, DRF throttle store)
- S3-compatible object storage for media (photos, QR codes) — set `USE_S3=True`
- A domain + TLS certificate in front of the app (nginx/Caddy/cloud load balancer)

## Required environment variables

See `backend/.env.example` for the full list. The ones that matter most
in production (defaults are dev-only and **must** be overridden):

| Variable | Why it matters |
|---|---|
| `DJANGO_SECRET_KEY` | Rotate from the dev default; treat as a secret |
| `DJANGO_DEBUG` | Must be `False` |
| `DJANGO_ALLOWED_HOSTS` | Your real domain(s), not `*` |
| `DATABASE_URL` | Managed Postgres connection string |
| `REDIS_URL` | Managed Redis connection string |
| `USE_S3`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME` | Media storage — without this, uploaded photos live on local (ephemeral) container disk |
| `GOOGLE_OAUTH_CLIENT_ID` | Required for Google Sign-In to work at all |
| `SMS_PROVIDER` + `SMS_API_KEY` | `console` (default) only logs OTPs — switch to a real provider before going live, see `apps/common/sms.py` |
| `SENTRY_DSN` | Error tracking; `config/settings/prod.py` wires it in automatically when set |
| `CORS_ALLOWED_ORIGINS` | Your actual web/mobile app origins |
| `FRONTEND_BASE_URL` | Used to build missing-person public share links |

## Deploying with Docker

```bash
cd backend
docker build -t resq-backend:latest .
```

The image is a multi-stage build: `native_engine` compiles in a Debian
stage with the required dev headers (libjpeg-turbo, libpng, OpenSSL,
libqrencode), and only the compiled `.so` + runtime libraries make it into
the final slim Python image — the C toolchain itself doesn't ship to
production.

Run migrations as a one-off task before rolling out new application
containers:

```bash
docker run --rm --env-file .env.production resq-backend:latest \
    python manage.py migrate
```

Then run the actual services (adapt to your orchestrator — this is the
docker-compose shape, translate 1:1 to ECS tasks / K8s deployments / etc.):

- **web**: `daphne -b 0.0.0.0 -p 8000 config.asgi:application` (ASGI — required for the SOS/disaster-mode WebSocket consumers; a plain WSGI/gunicorn deployment would silently drop real-time features)
- **celery_worker**: `celery -A config worker -l info`
- **celery_beat**: `celery -A config beat -l info` (only run one instance)

Put a reverse proxy (nginx/Caddy/cloud LB) in front of `web` for TLS
termination, and route WebSocket upgrade requests (`/ws/...`) to the same
Daphne backend — Channels needs the `Upgrade` header to reach it, so don't
strip it at the proxy.

## Database

- Run `python manage.py migrate` on every deploy before traffic shifts to new containers.
- `apps.common.models.BaseModel` soft-deletes (`is_deleted`/`deleted_at`) — a "delete" from the API never actually removes a row. Have a retention/purge job if that matters for compliance, rather than assuming space is reclaimed automatically.
- Every table has `created_by`/`updated_by` — useful for incident forensics ("who changed this hospital's verification status") without extra instrumentation.

## Background jobs (Celery)

Notifications (in-app creation → dispatch) and geo-targeted alert fan-out
run through Celery. If the worker is down, `Notification` rows still get
created (the DB write is synchronous) but `sent_at` never gets stamped and
push/SMS/email never actually fires — monitor Celery queue depth, not just
"is the process running."

## Real-time (Django Channels)

`config/asgi.py` wires `apps.sos.routing` and `apps.disaster_mode.routing`.
The channel layer is Redis-backed (`CHANNEL_LAYERS` in settings) — if Redis
is unavailable, WebSocket connections will fail to establish, but the REST
API keeps working (they're independent failure domains).

## Monitoring

- **Sentry**: set `SENTRY_DSN`; wired for Django, Celery, and Redis integrations in `config/settings/prod.py`.
- **Prometheus/Grafana**: not wired yet. The straightforward addition is `django-prometheus` (wraps DB/cache/request metrics) plus a `/metrics` endpoint scraped by Prometheus — add it as `apps.common` middleware alongside the existing `AuditLogMiddleware` when it's time.
- **Audit trail**: every state-changing `/api/` request is already logged to `apps.audit_logs.AuditLog` (actor, path, status code, request ID) — check there first for "what happened" questions before reaching for external tooling.

## Rolling back

Since migrations run as a separate step before traffic shifts, a bad
deploy can usually be rolled back at the container-image level without a
matching migration rollback — but only if the new migration was purely
additive (new nullable column, new table). Destructive migrations (column
removal, NOT NULL without a default) need a rollback plan decided at
review time, not after the fact.
