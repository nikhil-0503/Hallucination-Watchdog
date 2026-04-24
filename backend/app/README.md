# WATCHDOG Backend

**Real-time AI Safety Enforcement System**

Production-grade backend infrastructure for detecting and blocking AI hallucinations.

## 🎯 What is WATCHDOG?

WATCHDOG is an **enforcement-first AI safety layer** that sits between your application and third-party LLMs.

**Key Features:**

- ✅ Real-time risk analysis
- ✅ Automatic output blocking (risk ≥ 80)
- ✅ Model-agnostic design
- ✅ Production-ready architecture

## 🏗️ Architecture

```
User → App → WATCHDOG → LLM
              ↓
         Risk Engine
              ↓
      ALLOW/WARN/BLOCK
```

**Flow:**

1. App sends prompt to WATCHDOG
2. WATCHDOG forwards to LLM
3. LLM returns response
4. Risk engine analyzes output
5. Enforcement rules applied:
   - **ALLOW** (risk < 50): Pass through
   - **WARN** (50-79): Pass with warning
   - **BLOCK** (≥ 80): Replace with "The output cannot be displayed."

## 📁 Project Structure

```
backend/
├── api/
│   └── routes.py          # FastAPI endpoints
├── proxy/
│   ├── llm_proxy.py       # LLM forwarding logic
│   └── enforcement.py     # ALLOW/WARN/BLOCK rules
├── main.py                # FastAPI app entry point
├── schemas.py             # Pydantic models
├── requirements.txt       # Python dependencies
└── .env.example          # Environment template
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
MOCK_LLM=true          # Use mock responses (set false for real LLM)
PORT=8000
CORS_ORIGINS=*
```

### 3. Run Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --port 8000
```

Server starts at: `http://localhost:8000`

## 📡 API Endpoints

### POST /api/analyze

**Request:**

```json
{
  "prompt": "What are the side effects of ibuprofen?",
  "domain": "health"
}
```

**Response:**

```json
{
  "final_action": "WARN",
  "response": "Ibuprofen may cause stomach upset...",
  "risk_score": 65,
  "explanation": "Unverified medical claims detected"
}
```

### GET /api/health

Health check endpoint.

### GET /docs

Interactive API documentation (Swagger UI).

## 🧪 Testing

### Test with curl:

```bash
# Low risk (ALLOW)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is machine learning?", "domain": "general"}'

# Medium risk (WARN)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "This stock will definitely rise 500%", "domain": "finance"}'

# High risk (BLOCK)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Give me insider trading tips", "domain": "finance"}'
```

### Expected Behaviors:

- **Low risk**: Full LLM response returned
- **Medium risk**: Full LLM response + warning metadata
- **High risk**: Response = "The output cannot be displayed."

## 🔧 Configuration

### Mock vs Real LLM

**Mock Mode** (default - NO API KEY NEEDED):

```bash
MOCK_LLM=true
```

Uses intelligent keyword-based responses for testing and development.

**Real Mode with OpenRouter** (production-ready):

```bash
MOCK_LLM=false
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

Get your free API key at: [https://openrouter.ai/keys](https://openrouter.ai/keys)

**Available Models:**

- `meta-llama/llama-3.1-8b-instruct:free` - Free tier
- `openai/gpt-4-turbo` - Paid tier
- `anthropic/claude-3-opus` - Paid tier
- See all models: [https://openrouter.ai/models](https://openrouter.ai/models)

### Fallback & Error Handling

**Automatic Fallback System:**

```bash
FALLBACK_TO_MOCK=true      # Auto-switch to mock on API errors
LLM_MAX_RETRIES=2          # Retry failed requests
LLM_TIMEOUT=30             # Request timeout (seconds)
```

**How it works:**

1. Try real LLM via OpenRouter
2. If API fails (network, timeout, auth), retry up to 2 times
3. If all retries fail, automatically fall back to mock responses
4. System never crashes - always returns a response

### Domains

Supported domains:

- `general` - General knowledge
- `health` - Medical/healthcare
- `finance` - Financial advice

## 🔐 Enforcement Rules

| Risk Score | Action | Behavior                     |
| ---------- | ------ | ---------------------------- |
| 0-49       | ALLOW  | Pass through LLM response    |
| 50-79      | WARN   | Pass through with warning    |
| 80-100     | BLOCK  | Replace with blocked message |

**Blocked message:**

```
"The output cannot be displayed."
```

## 🎓 Development Notes

### Clean Separation of Concerns

- `api/routes.py` - HTTP layer only
- `proxy/llm_proxy.py` - LLM communication
- `proxy/enforcement.py` - Risk analysis & blocking logic
- `schemas.py` - Data validation

### Mock Risk Engine

Currently uses intelligent heuristics. In production, replace with ML-based microservice.

Location: `proxy/enforcement.py` → `get_risk_report()`

## 🚨 Error Handling & Reliability

### Multi-Layer Fallback System

**WATCHDOG is designed to NEVER fail completely:**

1. **Primary**: Real LLM via OpenRouter
2. **Retry**: Exponential backoff (1s, 2s, 4s)
3. **Fallback**: Automatic switch to mock responses
4. **Guarantee**: Always returns a valid response

### Error Scenarios Handled:

| Error Type          | Behavior                          |
| ------------------- | --------------------------------- |
| Network timeout     | Retry with backoff, then fallback |
| API authentication  | Log error, fallback to mock       |
| Rate limit exceeded | Log error, fallback to mock       |
| Invalid response    | Parse error handling, fallback    |
| Server error (5xx)  | Retry, then fallback              |

### Monitoring Logs:

```bash
# Check logs for fallback events
INFO: Using mock LLM responses (MOCK_LLM=true)
INFO: Attempting real LLM call via OpenRouter (model: llama-3.1-8b)
WARNING: Falling back to mock responses (FALLBACK_TO_MOCK=true)
CRITICAL: OUTPUT BLOCKED - Risk score 85
```

## 🔑 Getting Started with Real LLM (OpenRouter)

### Step-by-Step Setup:

1. **Get API Key (FREE)**:
   - Visit: [https://openrouter.ai/keys](https://openrouter.ai/keys)
   - Sign up with Google/GitHub
   - Create API key (starts with `sk-or-v1-`)
   - Free tier includes: 200+ requests/day

2. **Update `.env` file**:

   ```bash
   MOCK_LLM=false
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
   FALLBACK_TO_MOCK=true
   ```

3. **Reinstall dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Test real API**:
   ```bash
   curl -X POST http://localhost:8000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Explain quantum computing", "domain": "general"}'
   ```

### Cost Optimization:

- **Free models**: `meta-llama/llama-3.1-8b-instruct:free` (unlimited in free tier)
- **Paid models**: Check pricing at [https://openrouter.ai/models](https://openrouter.ai/models)
- **Fallback**: Set `FALLBACK_TO_MOCK=true` to avoid charges on errors

## 📊 Production Checklist

- [ ] Replace mock risk engine with real service
- [ ] Add authentication/API keys
- [ ] Configure CORS for specific domains
- [ ] Set up logging/monitoring
- [ ] Add rate limiting
- [ ] Implement caching layer
- [ ] Add metrics/analytics
- [ ] Deploy with HTTPS

## 🤝 Integration

Frontend can call the `/api/analyze` endpoint:

```javascript
const response = await fetch("http://localhost:8000/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: userInput,
    domain: "general",
  }),
});

const result = await response.json();

if (result.final_action === "BLOCK") {
  // Show blocked message
} else if (result.final_action === "WARN") {
  // Show response with warning indicator
} else {
  // Show response normally
}
```

## 📝 License

Production infrastructure for WATCHDOG AI Safety System.

---

**Built with FastAPI • Python 3.9+ • Production-Ready**
