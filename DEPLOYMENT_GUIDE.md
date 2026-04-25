# 🚀 WATCHDOG Deployment Guide

## ✅ Status: Code Pushed to GitHub

Your latest changes have been committed and pushed to:
```
https://github.com/Rijja-explore/Hallucination-Watchdog
Commit: ✨ UI Overhaul & Documentation
Branch: main
```

---

## 🎯 Choose Your Deployment Platform

### Option 1: Google Cloud Run (Recommended ⭐)

**Why:** Perfect for hackathon. Free tier, auto-scaling, Google's infrastructure.

#### Prerequisites:
- Google Cloud account (free tier available)
- gcloud CLI installed
- Docker installed

#### Deployment Steps:

```bash
# 1. Create GCP project (or use existing)
gcloud projects create hallucination-watchdog --name="WATCHDOG"
gcloud config set project hallucination-watchdog

# 2. Enable required APIs
gcloud services enable containerregistry.googleapis.com
gcloud services enable run.googleapis.com

# 3. Authenticate Docker
gcloud auth configure-docker

# 4. Deploy using our script
bash deploy-gcp.sh hallucination-watchdog watchdog-api us-central1
```

**Result:** Your app deployed at:
```
https://watchdog-api-[random].run.app
```

---

### Option 2: Railway (Easiest 🟢)

**Why:** GitHub integration, auto-deploy, beautiful dashboard.

#### Steps:

1. **Go to Railway:** https://railway.app
2. **Sign up** with GitHub
3. **Create new project**
4. **Select "Deploy from GitHub"**
5. **Select this repository:**
   ```
   Rijja-explore/Hallucination-Watchdog
   ```
6. **Configure environment:**
   ```
   GOOGLE_GENERATIVEAI_API_KEY=your_key_here
   MOCK_LLM=false
   ```
7. **Deploy!**

Railway automatically detects `railway.json` and deploys.

**Result:** Your app deployed at railway.dev domain with auto-SSL.

---

### Option 3: Docker Compose (Local)

**Why:** Development, testing, full control.

```bash
# Navigate to project root
cd Hallucination-Watchdog

# Build and run
docker-compose up --build

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

### Option 4: Heroku (Traditional)

**Why:** Simple, well-known, GitHub integration.

```bash
# Install Heroku CLI
# Create Procfile (already exists)

heroku login
heroku create watchdog-api
heroku config:set GOOGLE_GENERATIVEAI_API_KEY=your_key_here
git push heroku main
```

---

## 📋 Environment Variables

For any deployment, you'll need:

```env
# Required for full functionality
GOOGLE_GENERATIVEAI_API_KEY=your_key_from_ai.google.dev

# Optional (defaults to true for demo)
MOCK_LLM=false

# For CORS
CORS_ORIGINS=https://your-domain.com

# Logging
LOG_LEVEL=INFO
```

---

## 🔑 Get Google Gemini API Key

1. Visit: https://ai.google.dev
2. Click "Get API Key"
3. Create new key
4. Copy key
5. Add to your deployment environment

**Free tier:** 60 requests per minute (more than enough for hackathon demo)

---

## ✅ Verify Deployment

After deploying, test with:

```bash
# Health check
curl https://your-deployed-url/api/health

# Should return:
# {"status": "healthy", "version": "1.0.0"}
```

---

## 📊 Deployment Comparison

| Feature | GCP Cloud Run | Railway | Heroku | Docker Local |
|---------|---|---|---|---|
| **Cost** | Free tier ($0-$0.15/req) | Pay-as-you-go | $7/month | Free |
| **Setup Time** | 5 min | 2 min | 5 min | 10 min |
| **Auto-scale** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Manual |
| **Uptime** | 99.99% | 99.9% | 99.95% | Your machine |
| **SSL/HTTPS** | ✅ Built-in | ✅ Built-in | ✅ Built-in | Need setup |
| **Hackathon Ready** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |

---

## 🎓 Recommended Deployment Path

### For Hackathon:

1. **Immediate:** Deploy to Railway (2 minutes)
   - Fast setup for judges to test
   - Works perfectly for demo

2. **Then:** Deploy to GCP Cloud Run (5 minutes)
   - Shows Google integration
   - Demonstrates cloud expertise
   - Better for production scenarios

3. **Both running simultaneously** = more impressive to judges ✨

---

## 📱 Demo Credentials

After deployment, judges can login with:

```
🔐 Admin Dashboard
Email: admin@watchdog.ai
Password: Admin123!

👤 User Portal  
Email: user@watchdog.ai
Password: User123!
```

---

## 🚨 Troubleshooting

### "Image build failed"
```bash
# Ensure Docker is running
# For Windows, open Docker Desktop application
docker ps  # Should work without error
```

### "Permission denied" (gcloud)
```bash
# Ensure you're logged in
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### "API key not working"
```bash
# Verify API key is valid at: https://ai.google.dev
# Check key is set as environment variable
# Redeploy after setting variable
```

---

## 📞 Quick Help

| Problem | Solution |
|---------|----------|
| Deployment stuck | Check Docker is running |
| API 500 error | Check Gemini API key |
| Frontend not loading | Verify CORS settings |
| Slow response | Check free tier rate limit |

---

## 🏆 What Judges Will See

After deployment:

1. **Working Frontend** — Login page with beautiful new UI
2. **Admin Dashboard** — Historical bias analysis
3. **Chat Interface** — Real-time safety enforcement
4. **API Documentation** — Swagger at `/docs`
5. **Live Deployment** — Running on cloud infrastructure
6. **Code Quality** — Clean, documented, tested

---

## ✨ Next Steps

1. **Choose deployment option** → Pick one above
2. **Get Gemini API key** → 2 minutes at ai.google.dev
3. **Deploy** → 2-5 minutes depending on option
4. **Test** → Try /api/health endpoint
5. **Demo to judges** → Show working application
6. **Celebrate** → 🎉 You're deployed!

---

_Ready to deploy? Choose your platform and let's go! 🚀_
