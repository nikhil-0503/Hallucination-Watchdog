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
│   │   ├── main.py         # Application entry point
│   │   └── schemas.py      # Pydantic data models
│   │
│   ├── risk_engine/        # AI Risk Analysis (Member 2)
│   │   ├── analyzer.py     # Main risk analysis engine
│   │   ├── scorer.py       # Risk scoring algorithms
│   │   └── signals.py      # Hallucination signals
│   │
│   ├── policies/           # Policy Engine (Member 4)
│   │   ├── policy_engine.py  # ALLOW/WARN/BLOCK logic
│   │   └── policies.json   # Policy thresholds
│   │
│   ├── audit/              # Audit System (Member 4)
│   │   ├── audit_logger.py # Immutable audit logging
│   │   └── schemas.py      # Audit data structures
│   │
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React.js User Interface
│   ├── src/
│   │   ├── pages/          # Application pages
│   │   │   ├── LoginPage.js      # Role-based authentication
│   │   │   ├── SignupPage.js     # User registration
│   │   │   ├── UserChatPage.js   # Protected chat interface
│   │   │   ├── AdminDashboard.js # Admin monitoring
│   │   │   └── AdminAnalysis.js  # Detailed analysis
│   │   │
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, Data)
│   │   ├── services/       # API communication layer
│   │   └── styles/         # Tailwind + Custom CSS
│   │
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── package.json        # Node dependencies
│   └── public/             # Static assets
│
└── README.md               # This file
```

## 🔄 **Data Flow Architecture**

### **Complete Request Flow**

```
Frontend (React) 
    ↓ HTTP Request
Backend API (Member 1 - FastAPI)
    ↓ Forward to LLM
LLM Proxy (Member 1)
    ↓ Analyze Response
Risk Engine (Member 2 - ML Analysis)
    ↓ Apply Rules
Policy Engine (Member 4 - ALLOW/WARN/BLOCK)
    ↓ Log Decision
Audit Logger (Member 4 - Immutable Record)
    ↓ Return Safe Response
User Interface (Enforcement Applied)
```

### **Core Enforcement Logic**

```python
# NON-NEGOTIABLE ENFORCEMENT RULE
if action == "BLOCK":
    response = "The output cannot be displayed."
else:
    response = llm_response
```

**This is the core innovation: BLOCKED responses never reach users.**

## 🚦 **API Endpoints**

### **Core Endpoint**
```http
POST /api/analyze
Content-Type: application/json

{
  "prompt": "What are the side effects of ibuprofen?",
  "domain": "health"
}
```

**Response:**
```json
{
  "final_action": "ALLOW|WARN|BLOCK",
  "response": "Safe response or blocked message",
  "risk_score": 25,
  "explanation": "Low risk general knowledge query",
  "metadata": {
    "confidence": 87,
    "processing_time": 1.2,
    "rag_status": "verified"
  }
}
```

## 🔧 **Setup & Deployment**

### **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### **Demo Credentials**
- **Admin Access**: `admin@watchdog.ai` / `admin123`
- **User Access**: `user@test.com` / `user123`

## 🚀 **Quick Start**

1. **Start Backend**: `cd backend && uvicorn app.main:app --reload`
2. **Start Frontend**: `cd frontend && npm start`  
3. **Open Browser**: `http://localhost:3001`
4. **Login**: Use demo credentials above
5. **Test Safety**: Try prompts that trigger WARN/BLOCK actions

**WATCHDOG is now fully operational and ready for production deployment.**