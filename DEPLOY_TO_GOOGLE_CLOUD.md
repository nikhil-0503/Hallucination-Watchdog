# 🚀 DEPLOY TO GOOGLE CLOUD - COMPLETE GUIDE

**Your Project Status: ✅ READY TO DEPLOY**

---

## ✅ WHAT YOU ALREADY HAVE (Requirements Met!)

### Requirement 1: Cloud Deployment ✅
- **Docker configured** ([backend/Dockerfile](backend/Dockerfile))
- **Cloud Run deployment script** ([deploy-gcp.sh](deploy-gcp.sh))
- **Environment config ready** ([backend/app/.env.example](backend/app/.env.example))

### Requirement 2: Google AI Model (Gemini) ✅
- **Gemini API integrated** ([backend/bias_engine/bias_analyzer.py](backend/bias_engine/bias_analyzer.py))
- **Used for intelligent bias analysis**
- **Graceful fallback if unavailable**
- **Error handling & logging built-in**

### Requirement 3: Prototype ✅
- **Fully functional** (30/30 tests passing)
- **API endpoints working** (health, analyze-bias, audit-dataset, demo)
- **Demo scenarios ready** (lending, hiring, medical)

---

## 🎯 DEPLOYMENT OVERVIEW

You're deploying:
```
Your Local Laptop
      ↓
Docker Image (containerized)
      ↓
Google Cloud Registry
      ↓
Google Cloud Run (production)
      ↓
Public URL like: https://watchdog-api-xxxxx.run.app
```

**What this means:**
- ✅ Your app runs 24/7 in the cloud
- ✅ Judges can access it anytime
- ✅ Scales automatically
- ✅ You don't manage servers

---

## 🔧 WHAT YOU NEED (Prerequisites)

### 1. Google Account (Free)
- Already have one? ✅
- Need to create? → google.com

### 2. Google Cloud Project (Free)
- Sign up here: https://console.cloud.google.com/
- Free tier includes: $300 credit + always-free services
- Cloud Run is FREE (5,000 requests/month free)

### 3. Google Cloud CLI (gcloud)
```bash
# Check if already installed
gcloud version

# If not installed, download from:
# https://cloud.google.com/sdk/docs/install
```

### 4. Docker
```bash
# Check if installed
docker version

# If not installed, download from:
# https://www.docker.com/products/docker-desktop
```

### 5. Gemini API Key
```bash
# Get one from: https://makersuite.google.com/app/apikeys
# Click: "Create API Key"
# Copy the key (you'll need it in step 3)
```

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Set Up Google Cloud Project (5 minutes)

#### 1a. Create GCP Project
```bash
# Open: https://console.cloud.google.com/
# Click: "Select a Project" → "New Project"
# Project Name: watchdog-challenge
# Click: "Create"
# Wait 30 seconds for project to be created
```

#### 1b. Set as Active Project
```bash
# In terminal:
gcloud config set project watchdog-challenge

# Verify:
gcloud config list
# Should show: project = watchdog-challenge
```

---

### STEP 2: Enable Required APIs (3 minutes)

```bash
# Enable Container Registry
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Run
gcloud services enable run.googleapis.com

# Enable Artifact Registry (optional, but recommended)
gcloud services enable artifactregistry.googleapis.com

# Verify all enabled:
gcloud services list --enabled
```

---

### STEP 3: Create Gemini API Key (2 minutes)

```bash
# Go to: https://makersuite.google.com/app/apikeys
# Click: "Create API Key"
# Save it somewhere safe

# You'll need this key in the next step
# Example: AIzaSyDXxxx...xxxxx
```

---

### STEP 4: Build Docker Image (10 minutes)

```bash
# Navigate to project root
cd d:\Projects\Hallucination-Watchdog

# Build Docker image
docker build -t gcr.io/watchdog-challenge/watchdog-api:latest backend/

# This creates a Docker image with:
# - FastAPI backend
# - Gemini AI integration
# - All dependencies installed
# - Production-ready config

# Wait for build to complete (might take 5-10 minutes)
```

**What you'll see:**
```
Sending build context to Docker daemon...
Step 1/20 : FROM python:3.13-slim...
Step 2/20 : WORKDIR /app...
... (many steps)
Successfully tagged gcr.io/watchdog-challenge/watchdog-api:latest
```

---

### STEP 5: Push Image to Google Container Registry (5 minutes)

```bash
# Authenticate with GCP
gcloud auth configure-docker

# Push image to Google Container Registry
docker push gcr.io/watchdog-challenge/watchdog-api:latest

# This uploads your Docker image to Google Cloud
# So they can deploy it as a service
```

**What you'll see:**
```
Pushed image to gcr.io/watchdog-challenge/watchdog-api:latest
digest: sha256:abc123def456...
```

---

### STEP 6: Deploy to Cloud Run (5 minutes)

```bash
# Deploy the image as a Cloud Run service
gcloud run deploy watchdog-api \
  --image gcr.io/watchdog-challenge/watchdog-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_GENERATIVEAI_API_KEY=YOUR_GEMINI_API_KEY_HERE"

# Replace "YOUR_GEMINI_API_KEY_HERE" with your actual API key from Step 3
```

**What this does:**
- ✅ Takes your Docker image from Container Registry
- ✅ Creates a Cloud Run service
- ✅ Sets environment variables (Gemini API key)
- ✅ Makes it accessible to the internet
- ✅ Sets up auto-scaling
- ✅ Enables health checks

**What you'll see:**
```
Deploying container to Cloud Run service [watchdog-api] in project [watchdog-challenge]...

Waiting for deployment of service [watchdog-api]...
  ✓ Deploying new service revision [watchdog-api-001] ...

Service [watchdog-api] revision [watchdog-api-001] has been deployed and is serving 100% of traffic.

Service URL: https://watchdog-api-xxxxx.run.app
```

**SAVE THIS URL! YOU'LL NEED IT FOR SUBMISSION.**

---

### STEP 7: Verify Deployment (2 minutes)

```bash
# Test your deployed API
curl https://watchdog-api-xxxxx.run.app/api/health

# Should return:
# {"status": "healthy", "service": "WATCHDOG AI Safety Gateway", "version": "1.0.0"}

# Test a demo scenario
curl -X POST https://watchdog-api-xxxxx.run.app/api/demo/run/lending

# Should return demo results with bias detection
```

---

## ✨ WHAT YOU NOW HAVE

After deployment:

```
✅ Deployed Backend
   URL: https://watchdog-api-xxxxx.run.app
   
✅ Gemini AI Working in Cloud
   - Analyzes bias
   - Provides recommendations
   - Runs 24/7
   
✅ Auto-Scaling
   - Handles 1-1000+ requests
   - Automatically manages resources
   - You don't pay for idle time
   
✅ Public Access
   - Anyone can access it
   - Perfect for judges to test
   - Works from any device
```

---

## 🎯 YOUR 4 SUBMISSION LINKS

After deployment, you have:

```
1. GitHub: https://github.com/Rijja-explore/Hallucination-Watchdog
   ✅ Ready (push completed)

2. Demo Video: [Create 3-min recording]
   ⏳ Next step

3. MVP Link: https://watchdog-api-xxxxx.run.app
   ✅ Ready (just deployed!)

4. Working Prototype: https://watchdog-api-xxxxx.run.app
   ✅ Ready (same as MVP)
```

---

## 🚨 TROUBLESHOOTING

### Problem: Docker build fails
```
Solution:
1. Make sure Docker Desktop is running
2. Try: docker version
3. Ensure you're in the right directory
4. Try again: docker build -t ...
```

### Problem: gcloud not found
```
Solution:
1. Download Google Cloud SDK
2. Install it
3. Restart terminal
4. Try: gcloud version
```

### Problem: Authentication error
```
Solution:
gcloud auth login
# Follow the browser login
# Then try deployment again
```

### Problem: Deployment times out
```
Solution:
1. This is normal (Cloud Run is starting)
2. Wait 5 minutes
3. Try: gcloud run services list
4. Check Cloud Run console
```

### Problem: Gemini API key error
```
Solution:
1. Make sure API key is correct
2. Make sure it's enabled: https://makersuite.google.com/app/apikeys
3. Try: gcloud run deploy ... --set-env-vars "GOOGLE_GENERATIVEAI_API_KEY=YOUR_KEY"
```

---

## 📊 DEPLOYMENT CHECKLIST

Before you deploy, verify:

```
[ ] Google Cloud account created
[ ] gcloud CLI installed and authenticated
[ ] Docker installed and running
[ ] Gemini API key obtained
[ ] GitHub repo is public
[ ] All tests passing locally (30/30)
[ ] Backend runs locally without errors
[ ] Docker builds successfully locally
```

After deployment, verify:

```
[ ] Cloud Run service created
[ ] Service is running (green checkmark in Console)
[ ] Health check responds (curl /api/health)
[ ] Demo endpoint works (curl /api/demo/run/lending)
[ ] URL is public and accessible
```

---

## 🎬 FULL DEPLOYMENT SEQUENCE (Copy-Paste Ready)

```bash
# ========================================
# WATCHDOG GOOGLE CLOUD DEPLOYMENT
# ========================================

# 1. SET UP PROJECT
gcloud config set project watchdog-challenge

# 2. ENABLE APIS
gcloud services enable containerregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# 3. BUILD DOCKER IMAGE
cd d:\Projects\Hallucination-Watchdog
docker build -t gcr.io/watchdog-challenge/watchdog-api:latest backend/

# 4. AUTHENTICATE WITH GOOGLE
gcloud auth configure-docker

# 5. PUSH TO CONTAINER REGISTRY
docker push gcr.io/watchdog-challenge/watchdog-api:latest

# 6. DEPLOY TO CLOUD RUN (REPLACE WITH YOUR API KEY!)
gcloud run deploy watchdog-api \
  --image gcr.io/watchdog-challenge/watchdog-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_GENERATIVEAI_API_KEY=YOUR_GEMINI_API_KEY"

# 7. GET YOUR SERVICE URL
gcloud run services describe watchdog-api --region us-central1 --format='value(status.url)'

# 8. TEST IT
# Copy the URL and run:
# curl https://watchdog-api-xxxxx.run.app/api/health
```

---

## ⏱️ TOTAL TIME

- Step 1 (Setup): 5 min
- Step 2 (APIs): 3 min
- Step 3 (Gemini key): 2 min
- Step 4 (Build): 10 min
- Step 5 (Push): 5 min
- Step 6 (Deploy): 5 min
- Step 7 (Verify): 2 min

**TOTAL: ~30-35 minutes**

---

## 🏆 AFTER DEPLOYMENT

You'll have:

```
✅ Production deployment on Google Cloud
✅ Gemini AI running in cloud
✅ Public URL (https://watchdog-api-xxxxx.run.app)
✅ Auto-scaling, 24/7 uptime
✅ Everything judges need to test

= CHAMPIONSHIP-READY SUBMISSION
```

---

## 📝 NEXT STEPS

1. **Do you have:**
   - [x] Google Cloud account? → Yes
   - [x] gcloud CLI? → Install if not
   - [x] Docker? → Install if not
   - [x] Gemini API key? → Get from makersuite.google.com

2. **Ready to deploy?**
   → Follow the step-by-step guide above

3. **Need help?**
   → Tell me which step you're stuck on

4. **After deployment:**
   → Record demo video
   → Submit 4 links to Google Challenge

---

## 🎯 READY TO DEPLOY?

Do you want me to:

**A)** Walk you through deployment step-by-step (I'll guide each command)
**B)** Help you if you get stuck (tell me what happened)
**C)** Both - deploy together now

What's your move? 🚀
