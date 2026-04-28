# WATCHDOG — Unbiased AI Decision System
## Google Solution Challenge: Ensuring Fairness and Detecting Bias in Automated Decisions

**Powered by Google Gemini API** | **Deployed on Railway with Docker**

A comprehensive fairness audit platform that inspects datasets and AI models for hidden discrimination. Build a clear, accessible solution to thoroughly inspect data sets and software models for hidden unfairness or discrimination—then help organizations measure, flag, and fix harmful bias before it impacts real people.

---

## Overview

WATCHDOG is a **fairness audit platform powered by Google Gemini API** that helps organizations **measure, flag, and fix bias** in their automated decision systems. Computer programs now make life-changing decisions about job offers, bank loans, and medical care. If these programs learn from biased historical data, they amplify those discriminatory mistakes. WATCHDOG solves this by providing:

1. **Clear inspection** of datasets and models for hidden discrimination
2. **Accessible explanations** via Google Gemini (non-technical stakeholders understand findings)
3. **Easy measurement** - Upload CSV → Get fairness report in seconds
4. **Actionable remediation** - Concrete steps to fix bias before it impacts real people

Unlike post-hoc dashboards, WATCHDOG provides **pre-deployment bias inspection** to catch discrimination before models go live.

---

## Core Capabilities

| Capability | Description |
|---|---|
| **Bias Detection** | Detects protected-attribute discrimination (age, gender, race, ethnicity, disability, religion) in datasets. |
| **Fairness Metrics** | Demographic parity, equal opportunity, equalized odds, calibration, individual fairness. |
| **Google Gemini Analysis** | AI-powered explanations of *why* bias exists and how to fix it. |
| **Dataset Auditing** | Upload historical decisions; get comprehensive fairness reports with actionable insights. |
| **Remediation Guidance** | Google Gemini generates concrete steps to reduce bias (reweight data, adjust thresholds, etc.). |
| **Audit Logging** | Immutable JSON-based decision trail for compliance and accountability. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (React 19 - Browser)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Bias Audit  │  │ Executive    │  │ Remediation      │   │
│  │  Dashboard   │  │ Summary      │  │ Tracker          │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼──────────────────┼────────────────────┼────────────┘
          │                  │                    │
          └──────────────────┼────────────────────┘
                             │
┌─────────────────────────────▼─────────────────────────────┐
│                FastAPI Backend (Python)                    │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │/api/audit  │  │/api/analyze  │  │/api/health      │   │
│  │-dataset    │  │-bias         │  │                 │   │
│  └─────┬──────┘  └──────┬───────┘  └─────────────────┘   │
└────────┼─────────────────┼──────────────────────────────────┘
         │                 │
    ┌────▼──────┐     ┌────▼──────────┐
    │ Bias      │     │ Google        │
    │ Engine    │     │ Gemini API    │
    │ (Stats &  │     │ (Analysis &   │
    │ Metrics)  │     │ Remediation)  │
    └────┬──────┘     └────┬──────────┘
         │                 │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │ Audit Logger    │
         │ (JSON Storage)  │
         └─────────────────┘
```

### Components

| Module | Technology | Purpose |
|--------|-----------|---------|
| **Frontend** | React 19, Bootstrap | Fairness dashboards, audit reports |
| **API** | FastAPI (Python) | REST endpoints for bias analysis |
| **Bias Engine** | Python (custom algorithms) | Demographic parity, equal opportunity, calibration |
| **Gemini Integration** | Google Generative AI | Bias explanations, remediation guidance |
| **Deployment** | Docker, Railway | Container-based SaaS deployment |
| **Storage** | JSON files | Simple, audit-trail ready persistence |

---

## How It Works

### Fairness Audit Pipeline

**Goal:** Thoroughly inspect datasets for hidden discrimination and provide actionable remediation steps.

**Process:**

1. **Upload Dataset** — CSV with decision records (age, gender, race, decision outcome, etc.)
2. **Extract Demographics** — Identify protected attributes in the data
3. **Calculate Fairness Metrics:**
   - **Demographic Parity** — Do all groups have equal approval rates?
   - **Equal Opportunity** — Do all groups benefit equally from positive decisions?
   - **Equalized Odds** — Are false positive & true positive rates balanced?
   - **Calibration** — Is decision confidence consistent across groups?
4. **Detect Discrimination** — Identify statistically significant disparities
5. **Google Gemini Analysis** — Generate human-readable explanations:
   - *Why* this bias exists (likely root causes)
   - *How* to fix it (concrete remediation steps)
   - *Impact* projections ("If you do X, bias decreases by Y%")
6. **Generate Report** — Executive summary + detailed metrics + recommendations
7. **Track Remediation** — Monitor improvements over time

### Example: Loan Approval Analysis

**Input:** 1,000 loan decisions with demographics
```csv
applicant_id, age, gender, race, credit_score, decision
A001, 35, M, white, 750, approved
A002, 28, F, black, 750, denied
A003, 45, M, white, 700, approved
A004, 52, F, asian, 700, denied
...
```

**WATCHDOG Analysis:**
- Detects: Women denied loans 18% more often than men (demographic parity gap = 0.18)
- Detects: Age bias (applicants over 50 denied 35% more)
- **Gemini Explanation:** "Data shows systematic age discrimination. Likely cause: historical bias in training data (older applicants had higher default rates in past). Solution: (1) reweight training data to balance age groups, or (2) adjust approval thresholds to achieve 4/5ths rule."
- **Output:** Executive report showing bias, business impact, and specific remediation steps

---

## API Endpoints

### Bias Analysis

```bash
# Audit an entire dataset
POST /api/audit-dataset
{
  "decisions": [
    {"age": 35, "gender": "M", "race": "white", "decision": "approved"},
    {"age": 28, "gender": "F", "race": "black", "decision": "denied"},
    ...
  ],
  "outcome_field": "decision"
}

# Analyze a single decision
POST /api/analyze-bias
{
  "decision": {
    "applicant_id": "A123",
    "age": 35,
    "gender": "female",
    "race": "black",
    "credit_score": 750,
    "decision": "approved"
  }
}
```

### System Health

```bash
# Health check
GET /api/health
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ and pip
- Node.js 18+ and npm
- (Optional) Docker for containerized deployment

### Demo Credentials

**Admin Dashboard:**
```
Email: admin@watchdog.ai
Password: Admin123
```

**User Portal:**
```
Email: user@watchdog.ai
Password: User123
```

### 1. Clone & Setup

```bash
git clone https://github.com/Rijja-explore/Hallucination-Watchdog.git
cd Hallucination-Watchdog
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt

# Add your Gemini API key (optional but recommended)
echo "GOOGLE_GENERATIVEAI_API_KEY=your_key_here" > .env
echo "MOCK_LLM=true" >> .env

cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App available at: `http://localhost:3000`

### 4. Docker (One-Command Deploy)

```bash
docker-compose up --build
```

---

## 🌍 Deployment

### Current: Railway (Docker)

WATCHDOG is **deployed on Railway** using Docker containers:

```bash
# 1. Backend (FastAPI) runs on Railway
#    Automatically deployed from GitHub via railway.json

# 2. Frontend (React) runs on Railway
#    Served via Node.js server

# Local development with Docker Compose:
docker-compose up --build
```

**Benefits of Railway deployment:**
- ✅ Auto-deploys on push to GitHub
- ✅ Automatic HTTPS/SSL
- ✅ Built-in PostgreSQL (future)
- ✅ Environment variable management
- ✅ Scalable to enterprise load

### Future: Google Cloud Run (Phase 2)

*Planned enhancement (Q3 2026):*
- Migrate to Google Cloud Run for serverless auto-scaling
- Better integration with Google Cloud ecosystem
- Regional redundancy for 99.99% uptime

---

## 📡 API Endpoints

### Bias Analysis

```bash
# Analyze a single decision for bias
POST /api/analyze-bias
{
  "decision": {
    "applicant_id": "A123",
    "age": 35,
    "gender": "female",
    "race": "black",
    "credit_score": 750,
    "decision": "approved"
  },
  "outcome_field": "decision"
}

# Audit an entire dataset
POST /api/audit-dataset
{
  "decisions": [
    {"age": 35, "gender": "M", "race": "white", "decision": "approved"},
    {"age": 28, "gender": "F", "race": "black", "decision": "denied"}
  ],
  "outcome_field": "decision"
}
```

### Core Safety

```bash
# Chat with safety enforcement
POST /api/chat
{
  "prompt": "What are the side effects of ibuprofen?",
  "role": "user",
  "domain": "health"
}

# Health check
GET /api/health
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Bootstrap | Interactive dashboards |
| **Backend** | Python 3.11, FastAPI, Uvicorn | High-performance API |
| **AI Analysis** | Google Gemini API | Bias reasoning & explanations |
| **Bias Metrics** | Python (custom algorithms) | Fairness calculations |
| **Deployment** | Docker, Railway | Container-based SaaS |
| **Storage** | JSON files | Audit trail persistence |

---

## 🤝 SDG & Challenge Alignment

**Google Solution Challenge Track:** Unbiased AI Decision — Ensuring Fairness and Detecting Bias in Automated Decisions

**Challenge Objective:**
> "Build a clear, accessible solution to thoroughly inspect data sets and software models for hidden unfairness or discrimination. Provide organizations with an easy way to measure, flag, and fix harmful bias before their systems impact real people."

**How WATCHDOG Addresses This:**
1. ✅ **Thorough Inspection** — 5+ statistical fairness metrics detect hidden bias
2. ✅ **Clear & Accessible** — Google Gemini generates non-technical explanations
3. ✅ **Easy to Measure** — Upload CSV → Get fairness report in seconds
4. ✅ **Flag Discrimination** — Demographic parity, equal opportunity, calibration analysis
5. ✅ **Fix Before Impact** — Actionable remediation steps + projection modeling
6. ✅ **Real-World Impact** — Prevents discrimination in lending, hiring, healthcare

**UN SDG Alignment:**
- **SDG 5: Gender Equality** — Detects and prevents gender-based AI discrimination
- **SDG 10: Reduced Inequalities** — Prevents racial, age, economic bias
- **SDG 16: Peace, Justice & Strong Institutions** — Promotes algorithmic fairness and transparency

