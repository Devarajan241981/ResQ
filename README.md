# ResQ India — AI-Powered Emergency Community Platform

A modular emergency-coordination platform for India: missing persons
(including separate child/elderly workflows), lost pets, blood donation,
hospital/police/shelter directories, ambulance requests, disaster mode
(mark safe / need rescue / food / water / medicine), one-tap SOS with live
location, and volunteer/NGO coordination — built for real-time community
response, not just a CRUD app.

**Current state**: the backend is built, tested, containerized, and CI'd.
The Next.js web app, Flutter mobile app, and admin/super-admin dashboards
have not been started yet (see [`docs/ROADMAP.md`](docs/ROADMAP.md) for
exactly what's implemented vs. scaffolded vs. not started, module by
module).

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Django 5 + Django REST Framework, Python 3.12 |
| Realtime | Django Channels (WebSockets) over Redis |
| Database | PostgreSQL 16 |
| Cache / broker / channel layer | Redis 7 |
| Background jobs | Celery (worker + beat) |
| Auth | JWT (`djangorestframework-simplejwt`) — email/password, phone OTP, Google Sign-In; refresh rotation + blacklist; per-device sessions |
| Storage | Local disk (dev) / S3-compatible via `django-storages` + `boto3` (prod) |
| API docs | drf-spectacular (OpenAPI 3 / Swagger / ReDoc) |
| Native performance | Standalone C library (CMake) for geo math, image encode, QR batch rendering, crypto — see [`backend/native_engine/README.md`](backend/native_engine/README.md) |
| Tests | pytest + pytest-django + factory_boy |
| Containers | Docker (multi-stage, builds the native engine in-image) + docker-compose |
| CI | GitHub Actions (lint, native build, tests against real Postgres/Redis, Docker build) |

## Repository layout

```
ResQ/
  backend/                  Django project (see below)
  docs/
    ROADMAP.md              What's implemented vs. scaffolded vs. not started
    ARCHITECTURE.md          DDD layering, request/auth flow diagrams
    ER_DIAGRAM.md            Entity-relationship diagram (mermaid)
    DEPLOYMENT.md            Production deployment guide
  .github/workflows/
    backend-ci.yml           Lint + native build + tests + Docker build
```

```
backend/
  config/                   Django project: settings (base/dev/test/prod),
                             urls, celery.py, asgi.py (Channels routing)
  apps/
    common/                 Shared abstractions: BaseModel, permissions,
                             pagination, exceptions, middleware, geo math,
                             native.py (ctypes bridge)
    accounts/                Custom User, JWT/OTP/Google auth, device sessions
    audit_logs/               Request-level audit trail
    missing_persons/         ← flagship module, full DDD layering reference
    sos/  blood_donation/  disaster_mode/       ← priority modules, fully built
    hospitals/  volunteers/  shelters/  notifications/  police/  maps/
    search/  media/  analytics/                 ← supporting apps
    missing_children/  missing_elderly/  lost_pets/
    ambulance/  ngos/  organizations/  ai_matching/    ← scaffolded / interfaces
  native_engine/             C library + CMake build + ctypes-facing README
  requirements/               base.txt / dev.txt
  Dockerfile                 Multi-stage: builds native_engine, then the app
  docker-compose.yml          Postgres + Redis + Daphne + Celery worker/beat
  pytest.ini  conftest.py     Test configuration + shared fixtures
```

## Quickstart (Docker)

```bash
cd backend
docker compose up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_demo_data
docker compose exec backend python manage.py createsuperuser  # optional, seed_demo_data already makes a super_admin
```

- API: http://localhost:8000/api/v1/
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- Django admin: http://localhost:8000/admin/

Demo accounts created by `seed_demo_data` (password `DemoPass123!` for all):
`superadmin@resq.example`, `admin@resq.example`, `citizen@resq.example`,
`volunteer@resq.example`, `ngo@resq.example`, `hospital@resq.example`.

## Quickstart (local, no Docker)

Requires Python 3.12+, PostgreSQL, Redis, and (optionally, for the native
engine) `cmake` + `pkg-config` + libjpeg-turbo/libpng/openssl/qrencode dev
packages — see `backend/native_engine/README.md`. Without those, the app
still runs correctly using the pure-Python fallback path.

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements/dev.txt
cp .env.example .env   # then edit DATABASE_URL / REDIS_URL for your machine

python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver

# in separate terminals:
celery -A config worker -l info
celery -A config beat -l info
```

Build the native engine (optional, but the priority modules' "nearby"
searches and QR generation are faster with it):

```bash
cd native_engine
mkdir -p build && cd build && cmake .. && make
```

## Running tests

```bash
cd backend
source .venv/bin/activate
ruff check .
pytest                       # 40 tests: auth, missing persons, SOS,
                              # blood donation, disaster mode, native engine
python native_engine/tests/benchmark.py   # native vs. Python, real numbers
```

## Where to go next

- [`docs/ROADMAP.md`](docs/ROADMAP.md) — module-by-module status, what's real vs. scaffolded, what's genuinely not started (AI features, web/mobile/dashboard frontends)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the selectors/services/validators/signals layering, why plain lat/lng instead of PostGIS, how JWT auth + device sessions fit together
- [`docs/ER_DIAGRAM.md`](docs/ER_DIAGRAM.md) — entity relationships for the fully-built modules
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — production environment variables, Docker rollout, monitoring
- [`backend/native_engine/README.md`](backend/native_engine/README.md) — why the C engine exists, what it does and doesn't do, real (not aspirational) benchmark numbers
