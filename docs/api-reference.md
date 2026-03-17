# API Reference

## Base URL

Development: `http://localhost:8000`

All routes (except health check) require an `Authorization: Bearer <supabase-jwt>` header unless stated otherwise.

---

## Auth

### `POST /api/auth/verify`

Verifies a Supabase JWT and returns user info.

**Request**
- Header: `Authorization: Bearer <jwt>`

**Response `200`**
```json
{
  "user_id": "uuid",
  "email": "student@example.com",
  "role": "authenticated",
  "onboarding_completed": true
}
```

---

## Onboarding

### `POST /api/onboarding`

Save or update student profile and trigger curriculum generation.

**Request body**
```json
{
  "name": "Alice",
  "grade": "10",
  "background": "Loves science, struggles with algebra",
  "interests": ["Mathematics", "Physics"],
  "learning_goals": "Prepare for board exams"
}
```

**Response `200`**
```json
{"student_id": "uuid", "subjects_created": 2}
```

### `POST /api/onboarding/marksheet`

Upload a marksheet image/PDF. `multipart/form-data`, field name `file`. Max 10 MB. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.

**Response `200`**
```json
{"path": "marksheets/<student_id>/<filename>"}
```

---

## Curriculum

### `POST /api/curriculum/generate`

Generate (or return existing) curriculum for a subject.

**Request body**
```json
{"subject_name": "Physics"}
```

**Response `200`**
```json
{
  "subject_id": "uuid",
  "subject_name": "Physics",
  "chapters": [
    {
      "id": "uuid", "order_index": 1, "title": "Mechanics",
      "description": "...", "status": "available", "learning_objectives": ["..."]
    }
  ]
}
```

### `GET /api/curriculum/{subject_id}`

Get existing curriculum.

**Response `200`** — same shape as generate. `404` if not found, `403` if not owner.

### `GET /api/curriculum/{subject_id}/chapters/{chapter_id}`

Get a single chapter's metadata.

---

## Lessons

### `GET /api/lessons/{chapter_id}/content`

Get chapter content. Generated via Claude on first request, cached in DB thereafter.

**Response `200`**
```json
{
  "text": "Chapter explanation...",
  "key_concepts": ["Newton's Laws", "..."],
  "examples": ["..."],
  "diagrams": [{"title": "...", "mermaid": "graph TD..."}],
  "formulas": [{"description": "...", "latex": "F = ma"}],
  "summary": "..."
}
```

### `PATCH /api/lessons/{chapter_id}/status`

Update chapter status. Setting `completed` automatically unlocks the next chapter and triggers activity generation.

**Request body**
```json
{"status": "in_progress"}   // or "completed"
```

**Response `200`**
```json
{"chapter_id": "uuid", "status": "completed"}
```

### `GET /api/lessons/{chapter_id}/activities`

List all activities for a chapter.

### `POST /api/lessons/{chapter_id}/chat`

Stream teaching chat as Server-Sent Events (SSE). Each event is a text chunk.

**Request body**
```json
{"message": "Can you explain Newton's second law?"}
```

**Response**: `text/event-stream` — stream of `data: <chunk>\n\n` events.

---

## Activities

### `GET /api/activities/{activity_id}`

Get a single activity.

**Response `200`**
```json
{
  "id": "uuid", "chapter_id": "uuid", "type": "quiz",
  "status": "pending", "prompt": {"question": "...", "options": [...]}
}
```

### `POST /api/activities/{activity_id}/submit`

Submit a student's response. `409` if already submitted.

**Request body**
```json
{"response": {"answer": "B"}}
```

### `POST /api/activities/{activity_id}/evaluate`

AI-evaluate a submitted activity. Requires prior submission (`422` otherwise).

**Response `200`**
```json
{
  "activity_id": "uuid",
  "score": 85,
  "feedback": "Good understanding of the concept...",
  "guidance": "Review section on inertia.",
  "correct_answer": "..."
}
```

---

## Voice

### `POST /api/voice/session`

Create an OpenAI Realtime API ephemeral session token for client-side voice.

**Response `200`**
```json
{
  "session_id": "sess_xxx",
  "client_secret": "ek_xxx",
  "model": "gpt-4o-realtime-preview",
  "voice": "alloy"
}
```

**`502`** if OpenAI Realtime API is unreachable.

---

## Video / Sentiment

### `POST /api/video/analyze`

Analyze a video frame for sentiment using Claude Vision. Persists to DB and caches in Redis.

**Request body**
```json
{
  "chapter_id": "uuid",
  "frame_base64": "<base64-encoded JPEG>"
}
```

**Response `200`**
```json
{
  "emotion": "confused",
  "confidence": 0.81,
  "action_taken": "Slow down and re-explain with different examples."
}
```

**`502`** if Claude Vision fails.

### `WS /api/video/sentiment/ws?token=<jwt>`

WebSocket for streaming live sentiment. Send raw base64 frames as text messages; receive JSON sentiment objects back.

---

## Progress

### `GET /api/progress/{student_id}`

Get student progress across all subjects. Students can only access their own data (`403` otherwise).

**Response `200`**
```json
{
  "student_id": "uuid",
  "subjects": [
    {
      "subject_id": "uuid",
      "subject_name": "Mathematics",
      "chapters_completed": 3,
      "total_chapters": 10,
      "average_score": 82.5,
      "strengths": ["algebra"],
      "weaknesses": ["geometry"]
    }
  ]
}
```

---

## Health

### `GET /api/health`

No auth required.

**Response `200`**
```json
{"status": "healthy"}
```
