# WATCHDOG - Quick Start Guide for Google Solution Challenge

## ⚡ Get Running in 5 Minutes

### **Prerequisites**
- Python 3.9+ 
- Node.js 16+
- Docker (for Cloud deployment)
- Google account

---

## 🚀 **Option 1: Run Locally (Development)**

### Step 1: Get Gemini API Key
```bash
# Visit https://ai.google.dev/ and click "Get API Key"
# Copy your API key
export GOOGLE_GENERATIVEAI_API_KEY=your_key_here
```

### Step 2: Install Backend
```bash
cd backend/app
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GOOGLE_GENERATIVEAI_API_KEY
```

### Step 3: Run Backend
```bash
cd backend/app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
✅ Backend running at: http://localhost:8000
✅ API docs at: http://localhost:8000/docs

### Step 4: Run Frontend
```bash
cd frontend
npm install
npm start
```
✅ Frontend running at: http://localhost:3000

### Step 5: Test Bias Analysis
```bash
curl -X POST http://localhost:8000/api/analyze-bias \
  -H "Content-Type: application/json" \
  -d '{
    "decision": {
      "age": 35,
      "gender": "female",
      "race": "black",
      "credit_score": 750,
      "decision": "approved"
    }
  }'
```

---

## ☁️ **Option 2: Deploy to Google Cloud (Production)**

### Step 1: Get API Key
```bash
# At https://ai.google.dev/
export GOOGLE_GENERATIVEAI_API_KEY=your_key_here
export OPENROUTER_API_KEY=your_key_here  # Optional, for LLM
```

### Step 2: Run Deployment Script
```bash
cd /path/to/Hallucination-Watchdog
chmod +x deploy-gcp.sh
./deploy-gcp.sh watchdog-challenge watchdog-api us-central1
```

The script will:
1. ✅ Create GCP project
2. ✅ Enable required APIs
3. ✅ Build Docker image
4. ✅ Push to Container Registry
5. ✅ Deploy to Cloud Run
6. ✅ Return your service URL

### Step 3: Use Your API
```bash
# Backend API URL will be printed
curl https://watchdog-api-xxxxx.run.app/api/analyze-bias \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📊 **Key Features to Demo**

### **1. Single Decision Bias Analysis**
```bash
# Analyze a hiring decision for gender bias
curl -X POST http://localhost:8000/api/analyze-bias \
  -H "Content-Type: application/json" \
  -d '{
    "decision": {
      "applicant_name": "Jane Smith",
      "age": 32,
      "gender": "female",
      "experience_years": 8,
      "education": "Masters",
      "decision": "rejected",
      "reason": "Position filled"
    }
  }'

# Response includes:
# - Protected attributes detected
# - Bias score (0-100)
# - Fairness metrics
# - Gemini AI analysis
```

### **2. Dataset Fairness Audit**
```bash
# Audit 100 hiring decisions for systemic bias
curl -X POST http://localhost:8000/api/audit-dataset \
  -H "Content-Type: application/json" \
  -d '{
    "decisions": [
      {"age": 35, "gender": "M", "race": "white", "decision": "approved"},
      {"age": 28, "gender": "F", "race": "black", "decision": "denied"},
      ... more decisions ...
    ]
  }'

# Response includes:
# - Gender-based disparity statistics
# - Race-based disparity statistics
# - 4/5ths rule compliance analysis
# - Risky decisions flagged
# - Comprehensive Gemini audit report
```

### **3. Web Dashboard**
- Open http://localhost:3000
- Click "Fairness & Bias Analysis" tab
- Upload CSV with decisions
- View instant bias detection results
- See Gemini-powered recommendations

---

## 📁 **Project Structure**

```
watchdog/
├── backend/
│   ├── bias_engine/           ← NEW: Fairness analysis
│   │   ├── bias_analyzer.py   # Gemini integration
│   │   ├── bias_scorer.py     # Metrics calculation
│   │   └── demographic_utils.py
│   ├── app/
│   │   ├── api/routes.py      # NEW bias endpoints
│   │   └── schemas.py         # NEW bias schemas
│   ├── Dockerfile             ← NEW: Docker image
│   └── requirements.txt        (Updated with google-generativeai)
│
├── frontend/
│   └── src/pages/
│       ├── BiasAnalysisDashboard.js    ← NEW
│       └── BiasAnalysisDashboard.css
│
├── deploy-gcp.sh              ← NEW: GCP deployment
├── docker-compose.yml         ← NEW: Local docker setup
├── GCP_DEPLOYMENT.md          ← NEW: Cloud guide
├── IMPLEMENTATION_SUMMARY.md  ← NEW: Technical details
└── README.md                  (Updated)
```

---

## 🎯 **Challenge Requirements Checklist**

- [x] **Cloud Deployment**: Google Cloud Run ready
- [x] **Google AI Integration**: Gemini API for bias analysis
- [x] **Bias Detection**: Detects protected attributes & disparities
- [x] **Fairness Metrics**: 5+ metrics calculated
- [x] **Dataset Audits**: Comprehensive dataset analysis
- [x] **Web Interface**: Interactive dashboard
- [x] **Documentation**: Complete guides provided
- [x] **Production Ready**: Scalable, secure, monitored

---

## 📊 **What Gets Detected**

### **Protected Attributes**
✅ Age / Age groups
✅ Gender / Sex
✅ Race / Racial background
✅ Ethnicity / National origin
✅ Religion
✅ Disability status
✅ Sexual orientation

### **Fairness Metrics**
✅ Demographic Parity (Equal approval rates)
✅ Equal Opportunity (Equal TPR)
✅ Equalized Odds (Equal FPR/TPR)
✅ Calibration (Consistent confidence)
✅ 4/5ths Rule (Legal employment standard)

### **Risk Levels**
🟢 **LOW** (<10): Safe, minimal bias
🟡 **MEDIUM** (10-25): Concerning, review needed
🟠 **HIGH** (25-50): Severe bias detected
🔴 **CRITICAL** (>50): Critical fairness violation

---

## 🧪 **Testing Examples**

### **Test 1: Gender Bias in Lending**
```bash
curl -X POST http://localhost:8000/api/analyze-bias \
  -H "Content-Type: application/json" \
  -d '{
    "decision": {
      "applicant_id": "L001",
      "age": 45,
      "gender": "female",
      "income": 75000,
      "credit_score": 720,
      "loan_amount": 250000,
      "decision": "denied",
      "reason": "Insufficient collateral"
    }
  }'
```

### **Test 2: Age Discrimination in Hiring**
```bash
curl -X POST http://localhost:8000/api/analyze-bias \
  -H "Content-Type: application/json" \
  -d '{
    "decision": {
      "applicant_id": "H002",
      "age": 58,
      "gender": "male",
      "experience_years": 25,
      "education": "PhD",
      "decision": "rejected",
      "reason": "Overqualified"
    }
  }'
```

### **Test 3: Audit Historical Decisions**
```bash
# Create test_decisions.csv
age,gender,race,decision
25,M,white,approved
26,F,black,denied
27,M,asian,approved
28,F,white,denied
... (more rows)

# Upload and analyze
# POST to /api/audit-dataset with CSV data
```

---

## 📚 **Documentation Files**

| File | Purpose |
|------|---------|
| [README.md](README.md) | Project overview |
| [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md) | Cloud deployment guide |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Technical details |
| [backend/README.md](backend/README.md) | Backend architecture |
| http://localhost:8000/docs | Interactive API docs (Swagger) |

---

## 🆘 **Troubleshooting**

### **"GOOGLE_GENERATIVEAI_API_KEY not set"**
```bash
# Add to .env file
export GOOGLE_GENERATIVEAI_API_KEY=your_actual_key_here
```

### **Port 8000 already in use**
```bash
# Use different port
uvicorn main:app --reload --port 8001
```

### **CORS errors**
```bash
# Update CORS_ORIGINS in .env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### **Gemini API not responding**
```bash
# Check API key validity at https://ai.google.dev/
# System will fall back to statistical analysis
```

---

## ✅ **Ready to Submit?**

1. ✅ Backend running with Gemini integration
2. ✅ Frontend dashboard operational
3. ✅ Bias analysis endpoints tested
4. ✅ GCP deployment script ready
5. ✅ Documentation complete

**You're ready for the Google Solution Challenge!**

---

## 📞 **Support**

- **Gemini API Help**: https://ai.google.dev/
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/

---

**Let's make AI fair! 🎯⚖️**
