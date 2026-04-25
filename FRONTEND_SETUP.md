# Frontend Setup & Troubleshooting Guide

## 🚀 Quick Start

### Local Development (Recommended for Testing)

1. **Start the Backend** (in one terminal):
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. **Set Frontend Environment** (in project root):
```bash
# Create or update .env.local in frontend directory
echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env.local
```

3. **Start the Frontend** (in another terminal):
```bash
cd frontend
npm start
```

The frontend should open at `http://localhost:3000`

---

## 🔧 Environment Configuration

### Available Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000` |
| `REACT_APP_BACKEND_URL` | (Legacy) Same as above | `http://localhost:8000` |

### Where to Set Environment Variables

**For Local Development:**
- Create `frontend/.env.local`
- Or use `frontend/.env`

**For Production (Docker):**
- Set in `docker-compose.yml` or deployment platform

### Example `.env.local` File
```
REACT_APP_API_URL=http://localhost:8000
```

---

## ❌ Common Errors & Solutions

### Error: "Failed to load resource: 404"

**Cause:** Backend is not running or API URL is misconfigured

**Solution:**
1. Verify backend is running on port 8000:
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should return: `{"status": "ok"}`

2. Check `REACT_APP_API_URL` in `.env.local`:
   ```bash
   cat frontend/.env.local
   ```

3. Restart the frontend dev server to pick up new env vars

### Error: "Unexpected token '<', '<!DOCTYPE' is not valid JSON"

**Cause:** API endpoint is returning HTML error page instead of JSON (usually 404 or 500 error)

**Solution:**
1. Check that your backend API endpoint exists
2. Verify the backend is responding:
   ```bash
   curl http://localhost:8000/api/what-if-state
   ```
3. Check backend logs for errors

### WebSocket Connection Failed

**Cause:** WebSocket connection is not configured for local development

**Solution:**
- This is expected in production; local development doesn't require WebSocket
- The app gracefully falls back to HTTP polling

### "Cannot reach backend" / "API_BASE_URL not configured"

**Cause:** Frontend hasn't been configured with backend URL

**Solution:**
```bash
# Set the environment variable
export REACT_APP_API_URL=http://localhost:8000

# Or in frontend/.env.local
echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env.local

# Then restart the dev server
npm start
```

---

## 🔍 Testing Your Setup

### Check Backend Health
```bash
curl http://localhost:8000/api/health
# Expected: {"status": "operational"}
```

### Check Endpoints
```bash
# What-If State
curl http://localhost:8000/api/what-if-state

# Impact Metrics
curl http://localhost:8000/api/impact-metrics

# Community Patterns
curl http://localhost:8000/api/community-patterns

# Bias Analysis
curl -X POST http://localhost:8000/api/analyze-bias \
  -H "Content-Type: application/json" \
  -d '{"decision": {"id": "test"}}'
```

---

## 📊 Dashboard Features & Requirements

### What-If Scenarios
- ✅ Works offline with default values
- ✅ Loads real data from backend if available
- ✅ Shows informative error messages

### Impact Dashboard
- ✅ Shows default metrics if backend unavailable
- ✅ Updates with real data when backend is ready
- ✅ Displays status indicator

### Bias Analysis
- ✅ Single decision analysis
- ✅ Dataset audit
- ✅ Requires valid decision data

### Explainability Dashboard
- ✅ Shows analysis factors
- ✅ Displays risk score and recommendations
- ✅ Graceful error handling

### Community Hub
- ✅ Displays shared patterns
- ✅ Leaderboard and templates
- ✅ Error handling included

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start services
docker-compose up --build

# The app will be available at http://localhost:3000
```

### Environment Variables in Docker
Edit `docker-compose.yml`:
```yaml
environment:
  - REACT_APP_API_URL=http://backend:8000
```

---

## 🚀 Production Deployment

### For Railway, Vercel, or Other Platforms

1. **Set Environment Variables:**
   - `REACT_APP_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)

2. **Build:**
   ```bash
   npm run build
   ```

3. **Deploy the `frontend/build` directory**

---

## 🆘 Need More Help?

### Debug Mode
Enable browser DevTools → Console to see detailed errors

### Check Backend Logs
```bash
# If running locally
# You'll see logs in the terminal running `python -m uvicorn ...`

# For Docker
docker logs hallucination-watchdog-backend
```

### Verify Network
```bash
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000
```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] `REACT_APP_API_URL` set to correct backend URL
- [ ] Frontend started with `npm start`
- [ ] Can access http://localhost:3000
- [ ] DevTools Console shows no network errors
- [ ] Dashboard pages load (with or without data)
- [ ] No "404" errors for `/api/` endpoints

If all boxes are checked, your setup is working! 🎉
