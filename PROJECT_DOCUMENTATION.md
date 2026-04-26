# WATCHDOG - Technical Documentation

## What This Project Does

WATCHDOG intercepts AI model outputs in real-time:
1. **Risk Engine** → Analyzes for hallucinations (RAG verification, contradictions, confidence)
2. **Bias Engine** → Checks for discrimination (demographics, fairness metrics)
3. **Policy Engine** → Decides: ALLOW/WARN/BLOCK
4. **Audit Logger** → Records all decisions
5. **Admin Dashboard** → Shows all decisions and enforcement actions

---

## Login Credentials

```
Admin: admin@watchdog.ai / admin123
User:  user@watchdog.ai / User123!
```

---

## Core Components

### Risk Engine
- Detects hallucinations in LLM responses
- RAG (Retrieval-Augmented Generation) verification
- Contradictions detection
- Confidence/trust score (0-1)
- Returns risk score contribution

### Bias Engine
- Extracts demographics (age, gender, race, ethnicity)
- Calculates fairness metrics (demographic parity, equal opportunity)
- Uses Google Gemini for intelligent analysis
- Returns bias score (0-100)

### Policy Engine
- Combines risk + bias scores
- Enforcement decision:
  - ALLOW — Safe to show to user
  - WARN — Show with warning flag
  - BLOCK — Don't send to user

### Audit Logger
- Logs all decisions with metadata
- JSON lines format
- Used for admin visibility and compliance

---

## API Endpoints

### POST `/api/chat`
Forward LLM prompt through WATCHDOG analysis pipeline

**Request:**
```json
{
  "prompt": "What is...?",
  "role": "user",
  "domain": "health"
}
```

**Response:** (admin gets full metadata, user gets safe version)
```json
{
  "id": "decision-id",
  "user_output": "Safe response...",
  "action": "ALLOW|WARN|BLOCK",
  "confidence": 0.85,
  "warning_text": "⚠️ Warning..."
}
```

### POST `/api/analyze-bias`
Analyze specific decision for bias

### GET `/api/health`
System health check

---

## Frontend Pages

### User Chat
- Submit prompts
- View responses with enforcement applied
- See confidence scores
- View warnings or blocked messages

### Admin Dashboard
- View all decisions (ALLOW/WARN/BLOCK)
- Filter by action type
- See risk scores and confidence levels
- Historical analysis

### Activity Logs
- Searchable decision history
- Full metadata available

---

## Project Structure

```
backend/
├── app/main.py                    # FastAPI app
├── api/routes.py                  # Endpoints
├── bias_engine/                   # Bias analysis
├── proxy/enforcement.py           # Policy engine
├── audit/audit_logger.py          # Decision logging
└── tests/                         # Tests

frontend/
├── src/pages/
│   ├── UserChatPage.js           # User interface
│   ├── AdminDashboard.js         # Admin view
│   └── ActivityLogs.js           # History
└── package.json
```

---

## Environment Variables

```env
GOOGLE_GENERATIVEAI_API_KEY=your_key
MOCK_LLM=false
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
```

---

## Deployment

### Local
```bash
docker-compose up --build
```

### Cloud Run
```bash
bash deploy-gcp.sh PROJECT_ID watchdog-api us-central1
```

### Railway
```bash
# Connect GitHub repo, set env vars, auto-deploys
```

---

## Technology Stack

| Component | Tech |
|-----------|------|
| Backend | Python, FastAPI |
| Frontend | React |
| AI | Google Gemini |
| Deployment | Docker, Cloud Run |

---

## Testing

```bash
cd backend
pytest tests/ -v
```

---

_Last Updated: April 25, 2026_
