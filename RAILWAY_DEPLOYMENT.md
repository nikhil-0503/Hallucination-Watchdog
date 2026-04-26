# Railway Deployment Guide — WATCHDOG

## The Problem (Why CORS Was Broken)

Railway was building the **frontend Dockerfile** for the **backend service**.
The backend URL (`hallucination-watchdog-production-e39c.up.railway.app`) was serving
React HTML instead of FastAPI JSON. No code change can fix CORS when the backend
isn't even running.

## Root Cause

The backend `Dockerfile` had `WORKDIR /app/backend` at the end, but when Railway
builds from the `backend/` directory (Root Directory = "backend"), files are copied
to `/app/`, not `/app/backend/`. This caused the backend container to fail on startup,
and Railway fell back to the root `railway.toml` which runs `node server.js` (frontend).

## The Fix (What Was Changed in Code)

1. **backend/Dockerfile** — Removed broken `WORKDIR /app/backend`. Now runs from `/app`.
2. **backend/railway.toml** — Explicitly declares this is the backend service config.
3. **railway.toml** (root) — Explicitly declares this is the frontend service config.
4. **docker-compose.yml** — Uses `context: ./backend` for the backend service.

## What YOU Must Do in Railway Dashboard

### Step 1: Open Railway Dashboard
Go to https://railway.app/dashboard and open your WATCHDOG project.

### Step 2: Configure the BACKEND Service

1. Click the **backend service** (the one with URL `hallucination-watchdog-production-e39c...`)
2. Go to **Settings** tab
3. Find **Root Directory**
4. Change it from `.` to: `backend`
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Deploy Latest** (or wait for auto-deploy)

### Step 3: Configure the FRONTEND Service

1. Click the **frontend service** (the one with URL `hallucination-watchdog-frontend-production...`)
2. Go to **Settings** tab
3. Find **Root Directory**
4. Make sure it is set to: `.` (project root)
5. Click **Save**

### Step 4: Set Environment Variables

In the **backend service** → **Variables** tab, add:

```
GEMINI_API_KEY = your_actual_google_ai_key_here
```

Get your key at: https://ai.google.dev

Optional but recommended:
```
CORS_ORIGINS = https://hallucination-watchdog-frontend-production.up.railway.app
MOCK_LLM = false
```

### Step 5: Verify

Wait ~3 minutes for the backend to deploy, then test:

```bash
curl https://hallucination-watchdog-production-e39c.up.railway.app/api/health
```

**Expected result (JSON):**
```json
{"status":"healthy","service":"WATCHDOG AI Safety Gateway","version":"1.0.0"}
```

If you see HTML/JS instead, the backend service is still building the wrong Dockerfile.
Double-check Step 2 (Root Directory must be `backend`).

## Architecture Summary

```
Project Root
├── railway.toml          ← Frontend service config (Root Directory = ".")
├── Dockerfile            ← Frontend Dockerfile (Node.js + React build)
├── frontend/             ← React source code
│   └── ...
├── backend/              ← FastAPI source code
│   ├── railway.toml      ← Backend service config (Root Directory = "backend")
│   ├── Dockerfile        ← Backend Dockerfile (Python + uvicorn)
│   └── app/
│       └── main.py       ← FastAPI entry point
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `/api/health` returns HTML | Backend service building frontend Dockerfile | Set backend Root Directory = `backend` |
| CORS errors in browser | Backend not running or wrong CORS config | Verify backend health endpoint returns JSON |
| "GEMINI_API_KEY not set" | API key missing in Railway Variables | Add `GEMINI_API_KEY` to backend service |
| "Module not found" errors | Backend Dockerfile using wrong WORKDIR | Already fixed in latest commit — redeploy |

## Local Development (Docker Compose)

```bash
cd Hallucination-Watchdog
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# API Docs: http://localhost:8080/docs
```

