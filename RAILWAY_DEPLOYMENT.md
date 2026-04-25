# Railway Deployment Guide

## Prerequisites
- GitHub repository connected to Railway
- Railway account set up

---

## Deployment Steps

### Step 1: Connect Repository to Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Create new project → Import GitHub repo
3. Select `Hallucination-Watchdog`
4. Railway will auto-detect the configuration

### Step 2: Configure Environment Variables

In Railway Dashboard, set these variables:

**For Frontend Service:**
```
REACT_APP_API_URL=https://your-backend.railway.app
```

**Replace `your-backend` with your actual backend service URL**

### Step 3: Deploy

Railroad will automatically:
1. Detect `frontend/Dockerfile`
2. Build the React application
3. Serve it on port 3000

---

## Connecting Frontend to Backend

### If Backend is on Same Railway Project:

1. Create a new service for backend
2. Deploy backend with `backend/Dockerfile`
3. Get backend URL from Railway dashboard
4. Set `REACT_APP_API_URL` to backend URL in frontend variables
5. Redeploy frontend

### If Backend is on Different Railway Project:

1. Get the backend service URL
2. Set `REACT_APP_API_URL` to that URL in frontend variables
3. Deploy frontend

---

## Verification

After deployment:

1. Open your Railway app URL
2. Open DevTools (F12) → Console
3. Check for network errors
4. Try navigating to different pages:
   - What-If Scenarios
   - Impact Dashboard
   - Bias Analysis
   - Explainability
   - Community Hub

---

## Troubleshooting

### Build Fails

**Check logs in Railway dashboard:**
- Look for Node.js/npm errors
- Verify `REACT_APP_API_URL` is set before build

**Solution:**
```bash
# Ensure build is triggered with correct variables
# Railway auto-rebuilds on git push
git push origin main
```

### App Shows "Cannot reach backend"

**Cause:** `REACT_APP_API_URL` not set or incorrect

**Solution:**
1. Check Railway Variables
2. Verify backend URL is correct
3. Redeploy frontend (push to main or manually trigger)

### Blank Page

**Cause:** Build failed silently

**Solution:**
1. Check Railway logs for errors
2. Ensure all dependencies are in `package.json`
3. Verify `npm run build` works locally

---

## Health Check

Test your deployment:

```bash
# Frontend health
curl https://your-app.railway.app/

# Check if backend is configured
# Open DevTools Console and check for API errors
```

---

## Rollback

If something breaks:

```bash
# Check Railway dashboard for previous builds
# Select "Deploy" option for a previous successful build
```

---

## Local Testing Before Deployment

```bash
# Build locally
cd frontend
REACT_APP_API_URL=http://localhost:8000 npm run build

# Serve locally
npm install -g serve
serve -s build -l 3000

# Should be available at http://localhost:3000
```

---

## Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| `REACT_APP_API_URL` | Yes | `https://backend.railway.app` |

---

## Support

For issues:
1. Check Railway logs
2. Verify environment variables
3. Ensure backend is running and accessible
4. Check browser DevTools console

See `QUICK_FIX.md` and `FRONTEND_SETUP.md` for additional help.
