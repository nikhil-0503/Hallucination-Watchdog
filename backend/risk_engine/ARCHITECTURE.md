# WATCHDOG System Architecture

## High-Level Flow

```
┌──────────────┐
│ Application  │
│  (Your API)  │
└──────┬───────┘
       │
       │ 1. Send prompt + LLM response
       │
       ▼
┌──────────────────────────────────────────────┐
│          WATCHDOG Risk Engine                │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  analyzer.py (Orchestrator)         │   │
│  │                                     │   │
│  │  def analyze(prompt, response, rag) │   │
│  └──────────┬──────────────────────────┘   │
│             │                               │
│    ┌────────┼────────┐                     │
│    ▼        ▼        ▼                     │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Extract│ │Detect│ │Verify│               │
│  │Claims │ │Signals│ │ RAG  │               │
│  └───┬──┘ └───┬──┘ └───┬──┘               │
│      │        │        │                   │
│      └────────┼────────┘                   │
│               │                            │
│               ▼                            │
│    ┌────────────────────┐                 │
│    │   scorer.py        │                 │
│    │  - Calculate score │                 │
│    │  - Generate reason │                 │
│    └────────┬───────────┘                 │
│             │                              │
└─────────────┼──────────────────────────────┘
              │
              │ 2. Return risk assessment
              ▼
┌──────────────────────────────────────────────┐
│     Enforcement Layer (YOUR LOGIC)          │
│                                              │
│  if risk_score >= 70:  → BLOCK              │
│  elif risk_score >= 35: → WARN              │
│  else:                  → ALLOW             │
└──────────────────────────────────────────────┘
```

## Module Details

### 1. signals.py - Detection Layer

```
┌────────────────────────────────────────┐
│         Signal Detection               │
├────────────────────────────────────────┤
│                                        │
│  extract_claims()                      │
│    "Response" → ["Claim A", "Claim B"] │
│                                        │
│  detect_overconfidence()               │
│    Search for: "definitely",           │
│    "guaranteed", sensitive domains     │
│    → (True/False, reason)              │
│                                        │
│  detect_internal_contradictions()      │
│    Find timeline conflicts,            │
│    logical inconsistencies             │
│    → (True/False, details)             │
│                                        │
│  verify_against_rag()                  │
│    Compare claims to RAG docs          │
│    → {"claim": "SUPPORTED"}            │
│                                        │
│  extract_all_signals()                 │
│    Orchestrate all detections          │
│    → Complete signal dict              │
│                                        │
└────────────────────────────────────────┘
```

### 2. scorer.py - Scoring Layer

```
┌────────────────────────────────────────┐
│         Risk Scoring                   │
├────────────────────────────────────────┤
│                                        │
│  RISK_WEIGHTS = {                      │
│    internal_contradiction: +40         │
│    rag_contradiction: +35              │
│    rag_unverified: +15                 │
│    overconfidence: +20                 │
│  }                                     │
│                                        │
│  calculate_risk_score(signals)         │
│    Sum weights for detected signals    │
│    Cap at 100                          │
│    → int (0-100)                       │
│                                        │
│  generate_explanation(signals, score)  │
│    Build human-readable summary        │
│    → str                               │
│                                        │
│  get_risk_level(score)                 │
│    0-34:  LOW                          │
│    35-69: MEDIUM                       │
│    70-100: HIGH                        │
│                                        │
└────────────────────────────────────────┘
```

### 3. analyzer.py - Orchestration Layer

```
┌────────────────────────────────────────┐
│      Main Analysis Function            │
├────────────────────────────────────────┤
│                                        │
│  analyze(prompt, response, rag)        │
│                                        │
│  Step 1: Extract signals               │
│    ↓                                   │
│  Step 2: Calculate score               │
│    ↓                                   │
│  Step 3: Generate explanation          │
│    ↓                                   │
│  Step 4: Format output                 │
│    ↓                                   │
│  Return standardized JSON              │
│                                        │
└────────────────────────────────────────┘
```

## Data Flow Diagram

```
Input:
┌──────────────────────────────────────────────┐
│ prompt: "When did SSN College close?"       │
│ llm_response: "SSN College definitely        │
│               closed in 2026 and merged      │
│               with SNU."                     │
│ rag_results: None                           │
└─────────────┬────────────────────────────────┘
              │
              ▼
Extract Claims:
┌──────────────────────────────────────────────┐
│ claims = [                                   │
│   "SSN College definitely closed in 2026",   │
│   "merged with SNU"                          │
│ ]                                            │
└─────────────┬────────────────────────────────┘
              │
              ▼
Verify Against RAG:
┌──────────────────────────────────────────────┐
│ No RAG available                             │
│ → All claims marked UNVERIFIED               │
│                                              │
│ claim_verification = {                       │
│   "SSN College...": "UNVERIFIED",            │
│   "merged with SNU": "UNVERIFIED"            │
│ }                                            │
└─────────────┬────────────────────────────────┘
              │
              ▼
Detect Overconfidence:
┌──────────────────────────────────────────────┐
│ "definitely" detected                        │
│ → overconfidence = True                      │
│ → reason = "High confidence language"        │
└─────────────┬────────────────────────────────┘
              │
              ▼
Detect Contradictions:
┌──────────────────────────────────────────────┐
│ No timeline conflicts detected               │
│ → internal_contradiction = False             │
└─────────────┬────────────────────────────────┘
              │
              ▼
Calculate Score:
┌──────────────────────────────────────────────┐
│ rag_unverified: +15                          │
│ overconfidence: +20                          │
│ ─────────────────                            │
│ TOTAL: 35                                    │
└─────────────┬────────────────────────────────┘
              │
              ▼
Generate Explanation:
┌──────────────────────────────────────────────┐
│ "MEDIUM RISK: Response contains unverified   │
│  factual claims; Overconfidence detected:    │
│  High confidence language detected"          │
└─────────────┬────────────────────────────────┘
              │
              ▼
Output:
┌──────────────────────────────────────────────┐
│ {                                            │
│   "risk_score": 35,                          │
│   "signals": {                               │
│     "rag_contradiction": false,              │
│     "rag_unverified": true,                  │
│     "internal_contradiction": false,         │
│     "overconfidence": true                   │
│   },                                         │
│   "explanation": "MEDIUM RISK: ...",         │
│   "claims": [...]                            │
│ }                                            │
└──────────────────────────────────────────────┘
```

## Signal Detection Algorithms

### Claim Extraction
```
1. Split response by sentence-ending punctuation (., !, ?)
2. Clean whitespace
3. Filter out:
   - Very short fragments (< 10 chars)
   - Questions (ending with ?)
4. Return list of atomic claims
```

### Overconfidence Detection
```
1. Check for high-confidence patterns:
   - "definitely", "guaranteed", "absolutely"
   - "100%", "without doubt", "certainly"
   - "always", "never", "impossible"

2. Check for sensitive domains:
   - Medical: "health", "disease", "diagnosis"
   - Legal: "law", "court", "rights"
   - Financial: "invest", "stock", "money"

3. If sensitive domain + specific claims:
   - Years (e.g., 2020)
   - Percentages (e.g., 95%)
   - Money (e.g., $1000)
   → Flag as overconfident

Return: (bool, reason)
```

### Internal Contradiction Detection
```
1. Extract all years mentioned
2. Check for timeline conflicts:
   - "started in X" vs "active since Y"
   - Gap > 10 years → contradiction

3. Check for status contradictions:
   - "open" + "closed" in same response
   - "yes" + "no" near each other

4. Check for numerical conflicts:
   - Same entity with very different numbers
   - Order of magnitude differences

Return: (bool, details)
```

### RAG Verification
```
For each claim:
1. Extract key terms (words > 3 chars)
2. Calculate coverage in RAG text
3. If coverage >= 50%:
   a. Check for contradiction indicators near terms:
      - "not", "no", "never", "false", "wrong"
   b. If found → CONTRADICTED
   c. Else → SUPPORTED
4. If coverage < 50%:
   → UNVERIFIED

Return: {claim: status} dict
```

## Risk Score Calculation

```
score = 0

if internal_contradiction:
    score += 40  // Self-conflicting logic

if rag_contradiction:
    score += 35  // Conflicts with knowledge base

if rag_unverified:
    score += 15  // No supporting evidence

if overconfidence:
    score += 20  // Unjustified certainty

return min(score, 100)  // Cap at 100
```

## Explanation Generation Logic

```
issues = []

Priority order:
1. Internal contradictions → "Response contains internal contradictions"
2. RAG contradictions → "Contradicts retrieved information"
3. Unverified claims → "Contains unverified factual claims"
4. Overconfidence → "High confidence without evidence"

if score >= 70:
    prefix = "HIGH RISK: "
elif score >= 35:
    prefix = "MEDIUM RISK: "
else:
    prefix = "LOW RISK: "

explanation = prefix + "; ".join(issues)
```

## Integration Points

### 1. FastAPI Endpoint
```python
@app.post("/api/analyze")
def analyze_response(request):
    result = analyze(
        prompt=request.prompt,
        llm_response=request.llm_response,
        rag_results=request.rag_results
    )
    return result
```

### 2. Middleware
```python
class RiskCheckMiddleware:
    def process_llm_response(self, prompt, response, rag):
        risk = analyze(prompt, response, rag)
        
        if risk['risk_score'] >= 70:
            raise BlockResponseException(risk)
        
        return response
```

### 3. Async Processing
```python
async def check_batch(requests):
    results = analyze_batch(requests)
    return results
```

## Key Design Decisions

### 1. No External Dependencies
- Uses only Python standard library
- Fast startup, minimal footprint
- Easy deployment

### 2. Deterministic Detection
- No ML models that need training
- Predictable behavior
- Easy to debug

### 3. Graceful Degradation
- Works without RAG (marks as UNVERIFIED)
- Handles empty responses
- Never crashes on bad input

### 4. Separation of Concerns
- Detection → Scoring → Explanation
- Each module has single responsibility
- Easy to test and modify

### 5. Explainability First
- Every score has a reason
- Human-readable explanations
- Transparent algorithm

## Performance Characteristics

```
Average Analysis Time:
┌─────────────────────────────────────┐
│ Input Size      │ Time (ms)         │
├─────────────────┼───────────────────┤
│ Short (50 words)│ 5-10 ms           │
│ Medium (200 w)  │ 10-25 ms          │
│ Long (500 w)    │ 25-50 ms          │
└─────────────────────────────────────┘

Memory Usage:
- Per analysis: < 1 MB
- Stateless (no model loading)

Throughput:
- ~100-1000 analyses/second (single thread)
- Scales linearly with CPU cores
```

## Error Handling

```
Empty Response:
→ risk_score: 0, explanation: "Empty response"

Invalid RAG Format:
→ Gracefully ignores, treats as None

Missing Fields:
→ Uses defaults, continues analysis

Exceptions:
→ Caught at analyzer level
→ Returns safe default output
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** January 30, 2026
