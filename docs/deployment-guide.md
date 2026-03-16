# Deployment Guide

## Overview

LearnOS uses a split hosting model:
- **Backend**: Any Python WSGI/ASGI host (Railway, Render, Fly.io, AWS ECS, GCP Cloud Run)
- **Frontend**: Vercel (recommended for Next.js) or any static CDN with SSR support
- **Database / Auth / Storage / Realtime**: Supabase Cloud (managed)
- **Redis**: Upstash Redis (serverless) or ElastiCache / Redis Cloud

---

## Environment Variables

All secrets must be set in the host's environment / secret manager before deployment. Never commit `.env` files.

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (full DB access) |
| `SUPABASE_JWT_SECRET` | ✅ | JWT secret for token verification |
| `SUPABASE_DB_URL` | ✅ | Direct PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `OPENAI_API_KEY` | ✅ | OpenAI API key (Realtime) |
| `REDIS_URL` | ✅ | Redis connection string |
| `CORS_ORIGINS` | ✅ | JSON array of allowed origins, e.g. `["https://yourapp.vercel.app"]` |
| `CLAUDE_MODEL` | optional | Defaults to `claude-3-5-sonnet-20241022` |
| `CLAUDE_VISION_MODEL` | optional | Defaults to `claude-3-5-sonnet-20241022` |
| `OPENAI_REALTIME_MODEL` | optional | Defaults to `gpt-4o-realtime-preview` |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |

---

## Backend Deployment (Docker)

A minimal `Dockerfile` for the FastAPI backend:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and push:

```bash
docker build -t learnos-backend ./backend
docker tag learnos-backend <registry>/learnos-backend:latest
docker push <registry>/learnos-backend:latest
```

### Database Migrations

Run migrations as a pre-deploy step or init container:

```bash
cd backend && alembic upgrade head
```

---

## Frontend Deployment (Vercel)

1. Connect the GitHub repo to a Vercel project
2. Set **Root Directory** to `frontend`
3. Add all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js and builds accordingly

---

## Supabase Production Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Enable **Email Auth** in Authentication → Providers
3. Create storage buckets: `marksheets` (private), `content` (public)
4. Set RLS policies (see CLAUDE.md — Database Schema section)
5. Note the project URL, anon key, service role key, and JWT secret

---

## Redis Production

Use [Upstash](https://upstash.com) for serverless Redis compatible with any cloud host:
1. Create a free Redis database
2. Copy the `REDIS_URL` (format: `rediss://default:<password>@<host>:<port>`)
3. Set it in backend environment variables

---

## Health Check

The backend exposes `GET /api/health` — use this as the liveness/readiness probe:

```yaml
# Kubernetes / Cloud Run style
livenessProbe:
  httpGet:
    path: /api/health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30
```
