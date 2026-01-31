# WATCHDOG - AI Hallucination Detection & Output Control System

## 🚀 **Production-Ready Integration Complete**

WATCHDOG is an enterprise-grade AI safety platform that prevents harmful outputs from reaching users through real-time hallucination detection and enforcement policies.

## 📁 **Project Structure**

```
watchdog/
├── backend/                 # Complete Backend System
│   ├── app/                # FastAPI Main Application (Member 1)
│   │   ├── api/            # REST API endpoints
│   │   ├── proxy/          # LLM proxy & enforcement
# WATCHDOG - AI Hallucination Detection & Output Control System

WATCHDOG is an AI safety gateway that detects hallucinations and enforces ALLOW/WARN/BLOCK policies on LLM outputs.

**Quick overview**
- Project root: contains `backend/` (FastAPI) and `frontend/` (React).

**Prerequisites**
- **Python**: 3.9+ and `pip`
- **Node.js**: 16+ (recommended 18+) and `npm` or `yarn`

**Backend (development)**
- **Copy env file**: copy [backend/app/.env.example](backend/app/.env.example) to `backend/app/.env` and set `OPENROUTER_API_KEY` (or keep `MOCK_LLM=true` for local testing).
- **Install deps**:
```bash
cd backend/app
pip install -r requirements.txt
```
- **Run (dev, auto-reload)**:
```bash
cd backend/app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Alternative (from repository root):
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Open API docs**: `http://localhost:8000/docs`

**Frontend (development)**
- **Install deps & run**:
```bash
cd frontend
npm install
npm start
```
- By default the React dev server runs on `http://localhost:3000`.

**Production build (frontend)**
- Build static assets:
```bash
cd frontend
npm run build
```
- Serve the `build/` directory with any static host (nginx, `serve`, etc.).

**Environment notes**
- The backend env file is at [backend/app/.env.example](backend/app/.env.example). Key variables:
    - `MOCK_LLM`: `true` for local mock responses, `false` to call real LLM provider.
    - `OPENROUTER_API_KEY`: set when `MOCK_LLM=false`.
    - `HOST`, `PORT`, `RELOAD`, `CORS_ORIGINS`.

**Testing**
- Frontend: `cd frontend && npm test`
- Backend: if tests are added, run `pytest` from `backend/`.

**Troubleshooting**
- If the backend fails to import `app` when running from repository root, run uvicorn from `backend/app` using `uvicorn main:app`.
- If CORS blocks requests, adjust `CORS_ORIGINS` in the backend env file.

If you want, I can also add a short `dev` script to the root `README` or create a convenience `Makefile`/PowerShell script for Windows to start both servers together.