# API Route Implementation Plan — LearnOS

> **Status**: Approved — ready for implementation. Decisions recorded in Section 10.

---

## 1. Current State Assessment

### What exists (stubs only — no logic)
All routers are present with correct signatures but every handler returns `pass` or a placeholder.
Services have function signatures and docstrings but no implementation.
Models, schemas, core clients, and utils are well-structured and largely complete.

### What is missing
- All business logic in routers and services
- `.env` files (backend and frontend)
- Missing API routes (see Section 3)
- Missing schemas (activity generation, voice session)
- Auth on WebSocket endpoints (voice, sentiment)
- Rate limiting / file-size guards
- Tests (unit + integration) — all placeholder `assert True`

---

## 2. Existing API Routes — Review & Notes

| # | Method | Route | Current State | Notes |
|---|--------|-------|---------------|-------|
| 1 | POST | `/api/auth/verify` | ✅ Stub | Simple, low risk. Needs to also return `onboarding_completed` flag. |
| 2 | POST | `/api/onboarding` | ✅ Stub | Must save student record + create Subject rows + enqueue curriculum gen. |
| 3 | POST | `/api/onboarding/marksheet` | ✅ Stub | Must validate file type (image/pdf), enforce 10 MB max, upload to Supabase Storage. |
| 4 | POST | `/api/curriculum/generate` | ✅ Stub | Calls Claude; idempotent (return existing if already generated). |
| 5 | GET | `/api/curriculum/{subject_id}` | ✅ Stub | Ownership check: subject must belong to requesting user. |
| 6 | GET | `/api/lessons/{chapter_id}/content` | ✅ Stub | Return cached `content_json`; generate lazily if null. |
| 7 | POST | `/api/lessons/{chapter_id}/chat` | ✅ Stub | SSE stream; persist each exchange to `chat_messages`. |
| 8 | WS | `/api/voice/ws` | ✅ Stub | Missing auth. Must verify JWT from `?token=` query param before accepting. |
| 9 | POST | `/api/video/analyze` | ✅ Stub | Discard frame after analysis; persist only label to `sentiment_logs`. |
| 10 | WS | `/api/video/sentiment/ws` | ✅ Stub | Missing auth. Accept JWT query param. |
| 11 | POST | `/api/activities/{activity_id}/submit` | ✅ Stub | Idempotent — reject if already submitted. |
| 12 | POST | `/api/activities/{activity_id}/evaluate` | ✅ Stub | Reject if not yet submitted; call Claude evaluator; update score. |
| 13 | GET | `/api/progress/{student_id}` | ✅ Stub | Ownership check: student_id must match JWT sub. |

---

## 3. Additional API Routes Needed

| # | Method | Route | Reason |
|---|--------|-------|--------|
| A | GET | `/api/lessons/{chapter_id}/activities` | Frontend needs to list activities for a chapter before submission. |
| B | GET | `/api/activities/{activity_id}` | Fetch a single activity's prompt (for rendering the activity page). |
| C | POST | `/api/activities/{chapter_id}/generate` | Trigger AI generation of activities for a completed chapter. |
| D | PATCH | `/api/lessons/{chapter_id}/status` | Mark a chapter `in_progress` or `completed`; unlocks next chapter. |
| E | GET | `/api/curriculum/{subject_id}/chapters/{chapter_id}` | Get a single chapter's metadata (title, description, status). |
| F | POST | `/api/voice/session` | Create OpenAI Realtime ephemeral session token. Returns `client_secret` — browser connects directly to OpenAI. No WS proxy. |
| G | GET | `/api/progress/{student_id}/sentiment` | Return sentiment timeline for a session (for the sentiment dashboard). |
| H | GET | `/api/health` | ✅ Already exists in `main.py`. No change needed. |

---

## 4. Environment Configuration

### `backend/.env` (create this file — never commit)
```env
# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
SUPABASE_DB_URL=postgresql+asyncpg://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres

# Redis
REDIS_URL=redis://localhost:6379

# AI — API keys
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# AI — Model selection (change here to swap models globally)
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_VISION_MODEL=claude-3-5-sonnet-20241022
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview

# Server
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["http://localhost:3000"]

# Sentiment
SENTIMENT_FRAME_INTERVAL_MS=5000
SENTIMENT_CONFIDENCE_THRESHOLD=0.6

# Uploads
MAX_UPLOAD_SIZE_MB=10
ALLOWED_UPLOAD_EXTENSIONS=["image/jpeg","image/png","application/pdf"]

# Test DB (Supabase local dev)
TEST_DB_URL=postgresql+asyncpg://postgres:postgres@localhost:54322/postgres
```

### `frontend/.env.local` (create this file — never commit)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### `backend/.env.example` (safe to commit — no real secrets)
A copy of the above with empty values, so the template is version-controlled.

---

## 5. Implementation Plan (by module, in order)

### Phase 1 — Foundation fixes (no AI calls)

#### 5.1 `backend/.env` + `config.py` updates
- Add `max_upload_size_mb`, `allowed_upload_extensions`, `claude_model`, `claude_vision_model`, `openai_realtime_model`, `test_db_url` to `Settings`.
- Create `backend/.env.example` (committed — no real secrets, just key names + comments).

#### 5.2 `core/security.py` — WebSocket JWT helper
- Add `verify_supabase_jwt_ws(token: str) -> dict | None` (same logic, used for sentiment WS query param).

#### 5.3 `core/database.py` — connection URL fix
- Ensure `supabase_db_url` uses `postgresql+asyncpg://` driver prefix (SQLAlchemy async requires it).

#### 5.4 `routers/auth.py` — add `onboarding_completed`
- Query `students` table to include `onboarding_completed` in the response.

#### 5.5 `routers/onboarding.py` — full implementation
- Validate file type + size in `/marksheet`.
- In `/`: upsert `students` row, create `subjects` rows for each interest, set `onboarding_completed = true`.

#### 5.6 `routers/progress.py` — ownership guard
- Verify `student_id == jwt.sub`; return 403 otherwise.

---

### Phase 2 — Curriculum & Content

#### 5.7 `services/curriculum_generator.py`
- `generate_curriculum()`: Build a structured Claude prompt; parse JSON response into `ChapterSummary` list.
  - System prompt: "You are a K-12 curriculum designer. Output valid JSON only."
  - User prompt: includes subject, grade, background, difficulty.
  - Parse with `json.loads()` + Pydantic validation. Retry once on parse failure.
- `generate_chapter_content()`: Generate content_json with keys: `text`, `diagrams` (Mermaid), `formulas` (LaTeX), `key_concepts`, `summary`.

#### 5.8 `routers/curriculum.py` — full implementation
- `POST /generate`: Check if subject already exists; if so, return existing (curriculum is **preserved** on re-onboarding — never overwritten).
- `GET /{subject_id}`: Ownership check, return chapters from DB.
- `GET /{subject_id}/chapters/{chapter_id}`: Return single chapter metadata.

#### 5.9 `routers/lessons.py` — content + new routes
- `GET /{chapter_id}/content`: Return `content_json` if set; otherwise call `generate_chapter_content()`, persist, return.
- `PATCH /{chapter_id}/status`: Update chapter status; if `completed`, unlock next chapter.
- `GET /{chapter_id}/activities`: List all activities for the chapter.

---

### Phase 3 — Teaching Chat (SSE)

#### 5.10 `services/teaching_engine.py`
- Build system prompt: tutor persona, Socratic method, grade-appropriate language, chapter context injected.
- Call `claude_client.messages.stream()` and yield `data: <chunk>\n\n` SSE events.
- Persist full exchange to `chat_messages` after stream completes.

#### 5.11 `routers/lessons.py` — chat endpoint
- Fetch chapter + student metadata for context.
- Call `stream_teaching_response()`, wrap in `StreamingResponse`.
- Add `X-Content-Type-Options: nosniff` header (SSE security).

---

### Phase 4 — Activities

#### 5.12 `services/activity_evaluator.py`
- `evaluate_submission()`: Prompt Claude with activity type, prompt, student response, grade. Return structured JSON: `score`, `correctness`, `feedback`, `guidance`.
- `generate_activities()`: Given chapter content, generate 3–5 activities of varied types.

#### 5.13 `routers/activities.py` — full implementation
- Activities are **auto-generated** when `PATCH /{chapter_id}/status` sets status to `completed` (no separate generate endpoint needed — internal call only).
- `GET /{activity_id}`: Fetch single activity prompt.
- `POST /{activity_id}/submit`: Save response_json; reject if already submitted (409).
- `POST /{activity_id}/evaluate`: Require submission exists; call evaluator; update score + evaluation_json; update `student_progress`.

---

### Phase 5 — Voice

#### 5.14 `services/voice_manager.py` — already implemented
- `create_realtime_session()` exists and is correct.

#### 5.15 `routers/voice.py` — session token only (no WS proxy)
- `POST /session` (auth required): calls `create_realtime_session()`, returns `{ client_secret, session_id }` to browser.
- Browser connects directly to OpenAI Realtime using `client_secret`. FastAPI is not in the audio path.
- Remove WS proxy stub (`/ws`). No WS endpoint needed for voice.

---

### Phase 6 — Video Sentiment

#### 5.16 `services/sentiment_analyzer.py`
- `analyze_frame()`: Send base64 frame to Claude Vision with prompt: "Analyze this student's facial expression. Return JSON: `{emotion, confidence}`. Emotions: engaged|confused|bored|frustrated|happy|drowsy."
- Validate response confidence against `SENTIMENT_CONFIDENCE_THRESHOLD`.
- Frame is never stored; raw base64 discarded after call returns.

#### 5.17 `routers/video.py` — full implementation
- `POST /analyze`: Auth required. Call `analyze_frame()`, call `determine_adaptive_action()`, persist to `sentiment_logs`, cache in Redis with TTL=60s.
- `WS /sentiment/ws`: JWT via query param. Stream results from `POST /analyze` logic on each received frame.
- `GET /progress/{student_id}/sentiment` (on progress router): Return sentiment timeline from `sentiment_logs`.

---

### Phase 7 — Progress

#### 5.18 `routers/progress.py` — full implementation
- `GET /{student_id}`: Join `student_progress` + `subjects`; return aggregated data.
- `GET /{student_id}/sentiment`: Return recent sentiment logs (last 100 entries for session).

---

## 6. Security Checklist (per OWASP Top 10)

| Risk | Mitigation |
|------|-----------|
| Broken Access Control | Every route checks `jwt.sub == resource.student_id` before returning data. |
| Injection (prompt injection) | Student input is wrapped in quotes and role-separated in Claude messages; never concatenated into system prompts. |
| File upload abuse | Validate MIME type + file extension; enforce 10 MB max; scan filename for path traversal. |
| WebSocket auth bypass | JWT verified from query param **before** `websocket.accept()`; reject immediately on failure. |
| Sensitive data exposure | Raw video frames discarded after use; marksheets in private Supabase bucket (not public URL). |
| Rate limiting | Per-user rate limit on `/analyze` (max 12 req/min) and `/chat` (max 30 req/min) via Redis. |
| SSRF | Voice session endpoint only calls `api.openai.com`; no user-controlled URLs. |
| Cryptographic failures | JWTs verified with HS256 + `supabase_jwt_secret`; secrets never logged or returned. |

---

## 7. Test Plan

### 7.1 Unit Tests (pytest, fully mocked — no network/DB calls)

#### `tests/test_curriculum.py`
- `test_generate_curriculum_returns_chapters` — Mock Claude response; assert correct chapter count and structure.
- `test_generate_curriculum_parses_malformed_json_retries` — Mock first call returning bad JSON; second returning valid; assert success.
- `test_generate_chapter_content_has_required_keys` — Assert `text`, `diagrams`, `formulas`, `key_concepts`, `summary` in output.

#### `tests/test_teaching.py`
- `test_stream_teaching_response_yields_chunks` — Mock Claude stream; assert generator yields non-empty strings.
- `test_teaching_system_prompt_contains_grade` — Assert system prompt built with student grade.
- `test_socratic_method_in_prompt` — Assert system prompt includes Socratic instruction.

#### `tests/test_activities.py`
- `test_evaluate_submission_returns_score` — Mock Claude; assert score is 0–100 int.
- `test_evaluate_submission_returns_feedback` — Assert feedback and guidance strings present.
- `test_generate_activities_returns_varied_types` — Assert output includes at least 2 activity types.

#### `tests/test_sentiment.py`
- `test_analyze_frame_returns_valid_emotion` — Mock Claude Vision; assert emotion in allowed enum.
- `test_analyze_frame_returns_confidence_float` — Assert 0.0 ≤ confidence ≤ 1.0.
- `test_determine_adaptive_action_low_confidence` — Assert returns `None` when confidence < threshold.
- `test_determine_adaptive_action_bored` — Assert returns non-empty string for "bored".

#### `tests/test_voice.py`
- `test_create_realtime_session_sends_correct_model` — Mock httpx; assert `gpt-4o-realtime-preview` in request body.
- `test_create_realtime_session_includes_vad` — Assert `turn_detection.type == "server_vad"`.

#### `tests/test_security.py` (new)
- `test_verify_supabase_jwt_valid_token` — Assert valid JWT returns payload dict.
- `test_verify_supabase_jwt_expired_token` — Assert expired JWT returns `None`.
- `test_verify_supabase_jwt_wrong_secret` — Assert invalid secret returns `None`.
- `test_verify_supabase_jwt_wrong_audience` — Assert wrong audience returns `None`.

#### `tests/test_upload.py` (new)
- `test_marksheet_rejects_oversized_file` — Assert 413 when file > 10 MB.
- `test_marksheet_rejects_invalid_mime` — Assert 415 for `.exe` upload.
- `test_marksheet_rejects_path_traversal_filename` — Assert sanitized filename.

---

### 7.2 Integration Tests (pytest-asyncio + httpx AsyncClient, test DB)

All integration tests use:
- `AsyncClient` with `app` from `main.py`
- **Supabase local dev** (`supabase start`) — `TEST_DB_URL` in `.env` points to `localhost:54322`
- A valid test JWT signed with `TEST_JWT_SECRET` (local Supabase default secret)
- `conftest.py` fixtures: `auth_headers`, `test_student`, `test_subject`, `test_chapter`, `test_activity`
- Each test module uses a transaction rollback fixture to keep DB clean between tests

#### `tests/integration/test_auth_integration.py`
- `test_verify_returns_user_info` — POST `/api/auth/verify` with valid JWT; assert `user_id` and `email` returned.
- `test_verify_returns_401_no_token` — Assert 401 with no auth header.
- `test_verify_returns_401_bad_token` — Assert 401 with garbage token.

#### `tests/integration/test_onboarding_integration.py`
- `test_onboarding_creates_student_and_subjects` — POST `/api/onboarding`; assert student + subjects exist in DB.
- `test_onboarding_is_idempotent` — POST twice; assert no duplicate subjects.
- `test_marksheet_upload_stores_path` — POST `/api/onboarding/marksheet`; assert path returned and DB updated.
- `test_marksheet_upload_rejects_large_file` — Assert 413.

#### `tests/integration/test_curriculum_integration.py`
- `test_generate_curriculum_creates_chapters` — POST with mocked Claude; assert chapters in DB.
- `test_generate_curriculum_idempotent` — Generate twice; assert same subject returned.
- `test_get_curriculum_requires_ownership` — Access another student's subject; assert 403.

#### `tests/integration/test_lessons_integration.py`
- `test_get_lesson_content_generates_lazily` — First GET with no `content_json`; assert content generated and cached.
- `test_get_lesson_content_returns_cached` — Second GET; assert Claude not called again.
- `test_chat_streams_sse_events` — POST to chat; assert `Content-Type: text/event-stream`.
- `test_update_chapter_status_unlocks_next` — PATCH `completed`; assert next chapter status becomes `available`.

#### `tests/integration/test_activities_integration.py`
- `test_generate_activities_for_chapter` — POST; assert activities created in DB.
- `test_submit_activity_saves_response` — POST submit; assert `submitted_at` set.
- `test_submit_activity_rejected_twice` — Second submit returns 409.
- `test_evaluate_activity_returns_score` — POST evaluate; assert score 0–100.
- `test_evaluate_requires_prior_submission` — Evaluate before submit returns 422.

#### `tests/integration/test_video_integration.py`
- `test_analyze_frame_persists_sentiment` — POST with base64 image; assert log row in DB.
- `test_analyze_frame_discards_raw_frame` — Assert no image data stored in DB or storage.
- `test_analyze_frame_returns_adaptive_action` — Assert `action_taken` populated for low-confidence emotions.

#### `tests/integration/test_progress_integration.py`
- `test_get_progress_returns_all_subjects` — GET; assert all enrolled subjects returned.
- `test_get_progress_403_wrong_student` — Request another student's progress; assert 403.
- `test_sentiment_timeline_ordered_by_time` — Assert results ordered ascending by timestamp.

---

## 8. File Change Summary

### New files to create
| File | Purpose |
|------|---------|
| `backend/.env.example` | Template with all vars (no secrets) |
| `backend/tests/test_security.py` | JWT + auth unit tests |
| `backend/tests/test_upload.py` | File upload unit tests |
| `backend/tests/integration/` (directory + files) | Integration test suite |
| `backend/app/schemas/voice.py` | `VoiceSessionResponse` schema |
| `Makefile` | All dev + CI/CD commands (see Section 11) |
| `docs/dev-guide.md` | Developer setup, architecture, local dev workflow |
| `docs/admin-guide.md` | Supabase config, RLS setup, storage buckets, env management |
| `docs/api-reference.md` | All routes, request/response shapes, auth requirements |
| `docs/deployment-guide.md` | Docker, env vars, Supabase cloud, production checklist |

### Files to modify
| File | Changes |
|------|---------|
| `backend/app/config.py` | Add `max_upload_size_mb`, `allowed_upload_extensions`, `claude_model` |
| `backend/app/core/security.py` | Add `verify_supabase_jwt_ws()` |
| `backend/app/routers/auth.py` | Return `onboarding_completed` |
| `backend/app/routers/onboarding.py` | Full implementation + file validation |
| `backend/app/routers/curriculum.py` | Full implementation + new chapter route |
| `backend/app/routers/lessons.py` | Full implementation + status PATCH + activities list |
| `backend/app/routers/activities.py` | Full implementation + generate + GET single |
| `backend/app/routers/voice.py` | Replace WS stub with `POST /session` only |
| `backend/app/routers/video.py` | Full implementation; add JWT auth to WS |
| `backend/app/routers/progress.py` | Full implementation + sentiment timeline |
| `backend/app/services/curriculum_generator.py` | Implement both functions |
| `backend/app/services/teaching_engine.py` | Implement streaming chat |
| `backend/app/services/activity_evaluator.py` | Implement evaluate + generate |
| `backend/app/services/sentiment_analyzer.py` | Implement Claude Vision call |
| `backend/app/schemas/activity.py` | Add `ActivityGenerateResponse`, `ActivityDetail` |
| `backend/app/schemas/lesson.py` | Add `ChapterStatusUpdate` |
| `backend/app/schemas/voice.py` | `VoiceSessionResponse` with `client_secret` and `session_id` |
| `backend/tests/conftest.py` | Add `auth_headers`, `test_chapter`, `test_activity` fixtures |
| All existing test files | Replace placeholders with real tests |

---

## 9. Implementation Order (suggested)

```
1.  config.py + .env.example
2.  core/security.py (WS helper)
3.  All schemas (complete first — routers depend on them)
4.  services/curriculum_generator.py
5.  services/teaching_engine.py
6.  services/activity_evaluator.py
7.  services/sentiment_analyzer.py
8.  routers/auth.py
9.  routers/onboarding.py
10. routers/curriculum.py
11. routers/lessons.py (content + chat + status PATCH → auto-trigger activity gen)
12. routers/activities.py
13. routers/voice.py (POST /session only)
14. routers/video.py
15. routers/progress.py
16. tests/conftest.py (fixtures)
17. Unit tests
18. Integration tests
19. Makefile
20. docs/ (dev-guide, admin-guide, api-reference, deployment-guide)
```

---

## 10. Decisions Made

| # | Question | Decision |
|---|----------|----------|
| 1 | Voice WS proxy vs. session token | **Session token only** — `POST /voice/session` returns ephemeral token; browser connects directly to OpenAI. WS proxy removed. |
| 2 | Activity generation trigger | **Auto-generated** when chapter is marked `completed` via `PATCH /{chapter_id}/status`. No separate generate endpoint. |
| 3 | Curriculum idempotency on re-onboarding | **Preserved** — existing curricula are never overwritten. New subjects added only if not already present. |
| 4 | Test DB | **Supabase local dev** (`supabase start`). `TEST_DB_URL` in `.env` points to `localhost:54322`. |
| 5 | LLM models | All models configurable via `.env`. Defaults: `CLAUDE_MODEL=claude-3-5-sonnet-20241022`, `CLAUDE_VISION_MODEL=claude-3-5-sonnet-20241022`, `OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview`. |

---

## 11. Makefile — CI/CD Commands

A root-level `Makefile` will wrap all common operations so CI/CD pipelines and developers use the same commands.

```makefile
# --- Backend ---
install-backend        # pip install -r requirements.txt
dev-backend            # uvicorn app.main:app --reload
migrate                # alembic upgrade head
migrate-down           # alembic downgrade -1
test-unit              # pytest tests/ -m "not integration" -v
test-integration       # pytest tests/integration/ -v
test-all               # pytest -v
lint-backend           # ruff check app/ tests/
format-backend         # ruff format app/ tests/
type-check             # mypy app/

# --- Frontend ---
install-frontend       # npm install (in frontend/)
dev-frontend           # npm run dev
build-frontend         # npm run build
test-frontend          # npm run test
test-e2e               # npm run test:e2e
lint-frontend          # npm run lint

# --- Infrastructure ---
infra-up               # docker-compose up -d  (starts Redis)
infra-down             # docker-compose down
supabase-start         # supabase start        (local Supabase)
supabase-stop          # supabase stop

# --- Combined ---
dev                    # infra-up + supabase-start + dev-backend + dev-frontend (parallel)
test                   # test-unit + test-integration + test-frontend
ci                     # lint-backend + type-check + test-all + lint-frontend + test-frontend
```

---

## 12. Docs Folder Structure

```
docs/
├── dev-guide.md          # Prerequisites, local setup (clone → running in <15 min)
│                         # Architecture overview, folder structure, adding a new route
├── admin-guide.md        # Supabase project setup, RLS policies, storage bucket config,
│                         # env var management, secrets rotation
├── api-reference.md      # Every route: method, path, auth, request schema, response schema,
│                         # error codes, example curl commands
└── deployment-guide.md   # Docker Compose for prod, env checklist, Supabase cloud config,
                          # CI/CD pipeline setup (GitHub Actions example)
```

These will be written **after** implementation is complete so they reflect the actual code.
