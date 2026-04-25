# Quick Fix for Your Errors

## 🎯 Summary of Your Issues

You're seeing the following errors:
1. ❌ `/api/what-if-state` → 404 error
2. ❌ `/api/analyze-bias` → 404 error
3. ❌ `SyntaxError: Unexpected token '<', "<!DOCTYPE"` (HTML response)
4. ❌ WebSocket connection failed
5. ❌ Features not working: What-If, Bias Analysis, Explainability, Community

**Root Cause:** Backend is not running or not reachable from your frontend

---

## ✅ How to Fix It

### Step 1: Start the Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Configure Frontend Environment Variable

**Option A: Create `.env.local` file**
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
```

**Option B: Edit `frontend/.env.local` manually**
```
REACT_APP_API_URL=http://localhost:8000
```

### Step 3: Start Frontend

```bash
cd frontend
npm start
```

Wait for it to open at `http://localhost:3000`

### Step 4: Force Refresh in Browser

- Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) for hard refresh
- Or clear browser cache for `localhost:3000`

---

## 🧪 Verify It's Working

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Should show: `{"status":"operational"}`

2. **Check What-If Endpoint:**
   ```bash
   curl http://localhost:8000/api/what-if-state
   ```
   Should return JSON data (not HTML)

3. **Check Frontend Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - You should NOT see 404 errors
   - Should see successful API responses

---

## 📋 Expected Behavior After Fix

| Feature | Status | What You'll See |
|---------|--------|-----------------|
| What-If Scenarios | ✅ Working | Default scenario controls + simulation |
| Bias Analysis | ✅ Working | Analysis form + results |
| Explainability | ✅ Working | Factor breakdown + risk scores |
| Community Hub | ✅ Working | Shared patterns + leaderboard |
| Impact Dashboard | ✅ Working | Real metrics + organizational impact |
| Time Display | ✅ Using Local Time | Displays in your timezone |

---

## 🔧 Additional Configuration

### If Backend is on Different Machine

Replace `http://localhost:8000` with:
- `http://192.168.1.X:8000` (if on same network)
- `https://your-deployed-backend.com` (if deployed)

### Docker Setup

```bash
docker-compose up --build
# Then set: REACT_APP_API_URL=http://backend:8000
```

---

## 🆘 Still Not Working?

### Check These:

1. **Is Python running the backend?**
   ```bash
   # Terminal should show no errors, running on port 8000
   ps aux | grep uvicorn
   ```

2. **Is port 8000 in use?**
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Mac/Linux
   lsof -i :8000
   ```

3. **Did you set environment variable?**
   ```bash
   # Check what frontend has
   cat frontend/.env.local
   ```

4. **Did you restart frontend?**
   - Kill `npm start` (Ctrl+C)
   - Start again with `npm start`
   - Check console for API URL

5. **Check browser DevTools Network tab:**
   - Go to Application/Storage
   - Look for REACT_APP_API_URL
   - Make sure it's correct

---

## 📝 Files Modified for Better Error Handling

The following improvements have been made:

✅ **`frontend/src/services/api.js`**
- Better HTML error detection
- Proper error messages instead of crashes

✅ **`frontend/src/pages/WhatIfScenarios.js`**
- Default values when API fails
- Error message display
- Better fallback handling

✅ **`frontend/src/pages/ImpactDashboard.js`**
- Error banner
- Default metrics if API unreachable
- Status indicator

✅ **`frontend/src/pages/ExplainabilityDashboard.js`**
- Error handling
- Better error messages

---

## 🎯 Next Steps

1. ✅ Start backend: `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. ✅ Set environment: `echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env.local`
3. ✅ Start frontend: `npm start`
4. ✅ Hard refresh: `Ctrl+Shift+R`
5. ✅ Check Console: Should see no 404 errors

All features should work now! 🎉
