# Developer Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ (3.10 works) |
| Node.js | 20+ |
| Docker Desktop | latest |
| Supabase CLI | latest (`npm i -g supabase`) |

---

## Initial Setup

### 1. Clone and configure environment variables

```bash
# Copy the example env files and populate them
cp backend/.env.example backend/.env
# edit backend/.env with your keys (see api-reference.md for var descriptions)
cp frontend/.env.example frontend/.env.local   # if it exists
# or create frontend/.env.local manually (see CLAUDE.md for required vars)
```

### 2. Start local infrastructure

```bash
# Start Redis (the only local Docker dependency)
make infra-up

# Start Supabase local dev stack (Postgres + Auth + Storage + Realtime)
make supabase-start
# Note Supabase local URL/anon key printed by the CLI and add to .env files
```

### 3. Install dependencies

```bash
make install-backend    # creates backend/venv, installs requirements.txt
make install-frontend   # installs frontend node_modules
```

### 4. Run database migrations

```bash
make migrate   # runs alembic upgrade head against SUPABASE_DB_URL
```

### 5. Start development servers

```bash
# In separate terminals:
make dev-backend    # FastAPI on http://localhost:8000
make dev-frontend   # Next.js on http://localhost:3000
# or run both at once (Unix/macOS):
make dev
```

---

## Project Structure

```
backend/app/
  config.py          - Pydantic Settings (all env vars)
  main.py            - FastAPI app + CORS + router registration
  dependencies.py    - Shared FastAPI Depends (get_current_user)
  routers/           - Thin route handlers — delegates to services/
  services/          - Business logic (Claude AI, OpenAI, evaluations)
  models/            - SQLAlchemy ORM models
  schemas/           - Pydantic request/response models
  core/              - Infrastructure clients (DB, Redis, AI, Supabase, security)
  utils/             - Helpers (audio, image encoding)
```

---

## Running Tests

```bash
# Unit tests (no external services needed)
make test-unit

# Integration tests (requires supabase start)
make test-integration

# All backend tests
make test-backend

# All frontend unit tests
make test-frontend

# End-to-end tests (requires both servers running)
make test-e2e
```

### Unit Test Layout

Unit tests live in `backend/tests/` (excluding `tests/integration/`). All external dependencies (Claude, OpenAI, Supabase Storage, Redis) are mocked via `unittest.mock`. The test client uses `httpx.AsyncClient` with `ASGITransport` and FastAPI dependency overrides.

| File | What it covers |
|------|---------------|
| `test_security.py` | JWT verification, WS alias |
| `test_auth.py` | `/api/auth/verify` endpoint |
| `test_onboarding.py` | Student onboarding, marksheet upload guards |
| `test_curriculum.py` | Curriculum generation, chapter content, lesson status |
| `test_teaching.py` | SSE teaching chat, system prompt content |
| `test_activities.py` | Activity CRUD, submit/evaluate flow |
| `test_voice.py` | Voice session token creation |
| `test_sentiment.py` | Sentiment analyzer service, video router, progress router |

See `backend/tests/conftest.py` for the `http_client` and `mock_db` fixtures used across all unit tests.

### Integration Test Layout

Integration tests live in `backend/tests/integration/` and require `supabase start` + `alembic upgrade head`. They use the real FastAPI app with a real (local) Supabase DB. AI calls that would reach external APIs are mocked via fixtures defined in `tests/integration/conftest.py`.

| File | What it covers |
|------|---------------|
| `test_auth_onboarding_curriculum.py` | Auth, onboarding, curriculum, lesson content |
| `test_activities.py` | Activity CRUD, auth guards, submit/evaluate lifecycle |
| `test_voice.py` | Voice session endpoint, OpenAI Realtime mock |
| `test_video_progress.py` | Video sentiment analysis, progress endpoint |
| `test_e2e.py` | Full student journey scenarios (see below) |

**Integration fixtures** (`tests/integration/conftest.py`):

| Fixture | Purpose |
|---------|---------|
| `auth_headers` | Bearer token header using a locally-signed test JWT |
| `integration_client` | `AsyncClient` hitting the real app (no mocked DB) |
| `mock_claude` | Patches `claude_client.messages.create` and `.stream` with canned per-endpoint responses (curriculum, content, eval, activities, sentiment) |
| `mock_openai_realtime` | Patches `httpx.AsyncClient.post` to simulate OpenAI Realtime session creation |

### End-to-End Test Scenarios (`test_e2e.py`)

| Scenario | Tests |
|----------|-------|
| Auth & onboarding | JWT verify, onboard student, idempotency check |
| Curriculum | Generate, retrieve, wrong-owner 403 |
| Lesson & chapter | Content lazy generation, SSE chat (stubbed, needs DB seed) |
| Activities | Complete chapter → auto-generate activities → submit → evaluate (stubbed, needs DB seed) |
| Video sentiment | Frame analysis, adaptive actions, low-confidence null action |
| Progress | Own data accessible, other student 403 |
| Voice session | Ephemeral token creation, unauthenticated rejection |
| Auth coverage | Parametrized — all 14 API routes reject unauthenticated requests |

Tests that require a seeded DB are `pytest.skip`ped with instructions on how to enable them once `supabase start` is running and migrations have been applied.

Run only integration + E2E tests:

```bash
pytest tests/integration/ -m integration -v
```

---

## Code Quality

```bash
make lint-backend     # ruff check
make format-backend   # ruff format
make type-check       # mypy
make lint-frontend    # next lint
```

---

## Adding a New Route

1. Add the Pydantic schemas to `backend/app/schemas/`
2. Add business logic to `backend/app/services/`
3. Add the route handler to the appropriate file in `backend/app/routers/`
4. Register the router in `backend/app/main.py` if it's a new router file
5. Write tests in `backend/tests/test_<feature>.py`
6. Run `make test-unit` to verify

---

## Environment Variables Reference

See `backend/.env.example` for a complete annotated list. Key variables:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Full access key (backend only) |
| `SUPABASE_JWT_SECRET` | Used to verify auth tokens |
| `ANTHROPIC_API_KEY` | Claude API key (curriculum, teaching, vision) |
| `OPENAI_API_KEY` | OpenAI key (Realtime API for voice) |
| `REDIS_URL` | Redis connection string |
| `CLAUDE_MODEL` | Claude model for text (default: `claude-3-5-sonnet-20241022`) |
| `CLAUDE_VISION_MODEL` | Claude model for vision (default: `claude-3-5-sonnet-20241022`) |
| `OPENAI_REALTIME_MODEL` | OpenAI Realtime model (default: `gpt-4o-realtime-preview`) |
