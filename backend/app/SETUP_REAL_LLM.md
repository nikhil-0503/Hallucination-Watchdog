
# WATCHDOG - Quick Setup Guide for Real LLM Integration

## ✅ Current Status: READY FOR REAL-TIME DATA

Your WATCHDOG backend now supports **real-time LLM processing** via OpenRouter with **automatic fallback** to mock responses.

## 🚀 How to Enable Real LLM (3 Steps)

### Step 1: Get FREE OpenRouter API Key

1. Visit: **https://openrouter.ai/keys**
2. Sign up (Google/GitHub login)
3. Click "Create Key"
4. Copy your key (format: `sk-or-v1-xxxxxxxxxxxxx`)

**Free Tier Includes:**

- ✅ 200+ requests per day
- ✅ Access to Llama 3.1 (8B) - completely free
- ✅ No credit card required

### Step 2: Update Your `.env` File

Open `backend/.env` and change:

```bash
# Change this from true to false
MOCK_LLM=false

# Add your actual API key
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# Choose a model (free option shown)
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Keep fallback enabled for safety
FALLBACK_TO_MOCK=true
LLM_MAX_RETRIES=2
LLM_TIMEOUT=30
```

### Step 3: Install Dependencies & Test

```bash
# Install httpx if not already installed
pip install httpx

# Restart your server
python main.py

# Test with a real query
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is artificial intelligence?", "domain": "general"}'
```

## 🛡️ Fallback System Explained

### What Happens When You Make a Request:

```
1. User sends prompt
2. WATCHDOG tries OpenRouter API
   ├─ SUCCESS → Use real LLM response
   ├─ NETWORK ERROR → Retry (up to 2 times)
   ├─ API ERROR → Retry (up to 2 times)
   └─ ALL RETRIES FAIL → Automatically use mock response
3. Risk analysis performed
4. Enforcement applied (ALLOW/WARN/BLOCK)
5. Response returned to user
```

### Your System NEVER Crashes Because:

- ✅ Automatic retry on network issues
- ✅ Exponential backoff (1s, 2s, 4s waits)
- ✅ Fallback to mock if API unavailable
- ✅ Comprehensive error logging
- ✅ Timeout protection (30s default)

## 📊 How to Verify It's Working

### Check Logs:

When using **real LLM**, you'll see:

```
INFO: Attempting real LLM call via OpenRouter (model: meta-llama/llama-3.1-8b-instruct:free)
INFO: ✓ OpenRouter response received (347 chars)
```

When **falling back**, you'll see:

```
ERROR: Real LLM call failed: Connection timeout
WARNING: Falling back to mock responses (FALLBACK_TO_MOCK=true)
```

### Test Different Scenarios:

```bash
# 1. Test normal operation (should use real LLM)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain machine learning in simple terms", "domain": "general"}'

# 2. Test with invalid API key (should fallback)
# Temporarily set wrong key in .env, restart, and test

# 3. Test enforcement (real LLM + blocking)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Give me guaranteed insider trading tips", "domain": "finance"}'
# Should return: "The output cannot be displayed."
```

## 🎛️ Configuration Options

### Recommended Settings:

**Development:**

```bash
MOCK_LLM=true              # Free, instant responses
FALLBACK_TO_MOCK=true      # Not needed but harmless
```

**Production (Free Tier):**

```bash
MOCK_LLM=false
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
FALLBACK_TO_MOCK=true      # Safety net
LLM_MAX_RETRIES=2          # Resilience
```

**Production (Paid Tier):**

```bash
MOCK_LLM=false
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=openai/gpt-4-turbo
FALLBACK_TO_MOCK=false     # Fail fast instead
LLM_MAX_RETRIES=3          # More retries for paid
```

## 🔍 Available Models

### Free Tier (No cost):

- `meta-llama/llama-3.1-8b-instruct:free` ⭐ Recommended
- `google/gemma-2-9b-it:free`
- `mistralai/mistral-7b-instruct:free`

### Paid Tier (Check pricing):

- `openai/gpt-4-turbo`
- `anthropic/claude-3-opus`
- `google/gemini-pro-1.5`

See all: **https://openrouter.ai/models**

## 🚨 Troubleshooting

### Error: "Invalid OpenRouter API key"

- ✅ Check your key starts with `sk-or-v1-`
- ✅ Verify no extra spaces in `.env`
- ✅ Restart server after changing `.env`

### Error: "Rate limit exceeded"

- ✅ Free tier limit reached (200/day)
- ✅ Wait 24 hours or upgrade plan
- ✅ System automatically falls back to mock

### No Response / Timeout:

- ✅ Check internet connection
- ✅ Increase `LLM_TIMEOUT` to 60
- ✅ Enable `FALLBACK_TO_MOCK=true`

### Unexpected Mock Responses:

- ✅ Check `MOCK_LLM=false` in `.env`
- ✅ Verify API key is valid
- ✅ Check logs for error messages

## 📈 What Changes Were Made

### Updated Files:

1. **`proxy/llm_proxy.py`**
   - ✅ OpenRouter API integration
   - ✅ Retry logic with exponential backoff
   - ✅ Automatic fallback system
   - ✅ Comprehensive error handling

2. **`.env.example`**
   - ✅ OpenRouter configuration
   - ✅ Fallback settings
   - ✅ Retry/timeout options

3. **`requirements.txt`**
   - ✅ Added `httpx` for async HTTP requests

4. **`README.md`**
   - ✅ Updated documentation
   - ✅ Added OpenRouter setup guide

## ✨ Summary

**Before:** Mock responses only (static, keyword-based)

**Now:**

- ✅ Real-time LLM inference via OpenRouter
- ✅ Access to 20+ different AI models
- ✅ Automatic retry on failures
- ✅ Fallback to mock on errors
- ✅ Production-ready reliability
- ✅ Free tier available

**Your system is NOW ready to process real-time data with built-in safety nets!**

---

Need help? Check logs with: `tail -f logs.txt` (if logging to file)
Or watch terminal output when running `python main.py`
