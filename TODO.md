# Deployment Fix TODO

## Plan
Fix `ModuleNotFoundError: No module named 'app'` and related deployment configuration issues.

## Steps

- [x] Step 1: Create `backend/app/__init__.py` (missing package initializer)
- [x] Step 2: Fix `backend/Dockerfile` (WORKDIR, CMD, HEALTHCHECK)
- [x] Step 3: Fix `railway.json` startCommand
- [x] Step 4: Fix `docker-compose.yml` (dockerfile path, volumes, command)
- [x] Step 5: Fix unreachable dead code in `backend/app/proxy/enforcement.py`
- [x] Step 6a: Fix `main.py` relative import beyond top-level package
- [x] Step 6b: Verify fixes locally (all imports + uvicorn importer pass)

## Verification Results

- `import app.main` → SUCCESS
- `uvicorn.importer.import_from_string('app.main:app')` → SUCCESS
- All sibling modules (demo_handler, audit, bias_engine, risk_engine, policies) → SUCCESS

