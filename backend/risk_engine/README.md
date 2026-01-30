# WATCHDOG Risk Engine 🔍

**Real-time AI hallucination detection and risk scoring system**

---

## What is WATCHDOG?

WATCHDOG is a production-grade risk analysis engine that sits between your application and an LLM. It evaluates AI responses **before** users see them and provides structured risk assessments.

### What WATCHDOG Does ✅

- Estimates hallucination risk (0-100 score)
- Detects contradiction signals
- Identifies overconfident language
- Provides explainable output
- Works with or without RAG

### What WATCHDOG Does NOT Do ❌

- Make enforcement decisions (ALLOW/WARN/BLOCK)
- Retrain models
- Access model internals
- Guarantee truth

**Core Principle:** *"We don't decide what is true — we decide what is risky."*

---

## Architecture

```
backend/
├── risk_engine/
│   ├── __init__.py        # Package exports
│   ├── analyzer.py        # Main orchestrator
│   ├── scorer.py          # Risk scoring logic
│   └── signals.py         # Signal detection
└── test_risk_engine.py    # Test suite
```

### Module Responsibilities

**signals.py** - Detection Layer
- Extract atomic claims from responses
- Detect overconfident language patterns
- Find internal contradictions
- Verify claims against RAG data

**scorer.py** - Scoring Layer
- Calculate aggregate risk scores (0-100)
- Generate human-readable explanations
- Apply weighted scoring rules

**analyzer.py** - Orchestration Layer
- Main `analyze()` function
- Coordinates detection and scoring
- Returns standardized JSON output

---

## Input Format

```python
analyze(
    prompt: str,              # User's question
    llm_response: str,        # Raw LLM output
    rag_results: List[Dict]   # Optional RAG documents
)
```

### RAG Format (Optional)
```python
rag_results = [
    {
        "content": "Retrieved text content...",
        "metadata": {...}  # Optional metadata
    },
    ...
]
```

---

## Output Format

```json
{
  "risk_score": 72,
  "signals": {
    "rag_contradiction": false,
    "rag_unverified": true,
    "internal_contradiction": false,
    "overconfidence": true
  },
  "explanation": "MEDIUM RISK: Response contains unverified factual claims; Overconfidence detected: High confidence language detected",
  "claims": [
    {
      "text": "SSN College is merging with SNU",
      "rag_status": "UNVERIFIED"
    }
  ]
}
```

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| `risk_score` | int | Risk level (0-100) |
| `signals` | dict | Boolean flags for detected signals |
| `explanation` | str | Human-readable risk summary |
| `claims` | list | Per-claim analysis with RAG status |

### RAG Status Values

- **SUPPORTED** - Claim matches retrieved data
- **CONTRADICTED** - Claim conflicts with RAG
- **UNVERIFIED** - No matching information found (≠ false!)

---

## Risk Scoring

### Weights (Hardcoded)

| Signal | Weight | Description |
|--------|--------|-------------|
| Internal Contradiction | +40 | Timeline conflicts, logical inconsistencies |
| RAG Contradiction | +35 | Conflicts with retrieved knowledge |
| RAG Unverified | +15 | No supporting evidence found |
| Overconfidence | +20 | Absolute certainty language |

**Final score is capped at 100**

### Risk Levels

| Score Range | Level | Typical Action |
|-------------|-------|----------------|
| 0-34 | LOW | Allow |
| 35-69 | MEDIUM | Warn |
| 70-100 | HIGH | Consider blocking |

*Note: Enforcement decisions are made by your policy layer, not WATCHDOG*

---

## Usage Examples

### Basic Usage

```python
from risk_engine import analyze

result = analyze(
    prompt="What is the capital of France?",
    llm_response="The capital of France is Paris.",
    rag_results=[
        {"content": "Paris is the capital of France."}
    ]
)

print(result['risk_score'])  # 0 (LOW RISK)
```

### Without RAG (Graceful Degradation)

```python
result = analyze(
    prompt="Tell me about quantum computing",
    llm_response="Quantum computing uses qubits...",
    rag_results=None  # No RAG available
)

# System still works - marks claims as UNVERIFIED
print(result['signals']['rag_unverified'])  # True
```

### Detecting Overconfidence

```python
result = analyze(
    prompt="Should I take this medication?",
    llm_response="You should definitely take 800mg immediately. This will absolutely cure you.",
    rag_results=None
)

print(result['signals']['overconfidence'])  # True
print(result['risk_score'])  # 35 (MEDIUM RISK)
```

### Integration with FastAPI

```python
from fastapi import FastAPI
from risk_engine import analyze

app = FastAPI()

@app.post("/api/check-response")
def check_response(data: dict):
    # Call WATCHDOG
    risk_result = analyze(
        prompt=data['prompt'],
        llm_response=data['llm_response'],
        rag_results=data.get('rag_results')
    )
    
    # Your enforcement layer makes the decision
    if risk_result['risk_score'] >= 70:
        action = "BLOCK"
    elif risk_result['risk_score'] >= 35:
        action = "WARN"
    else:
        action = "ALLOW"
    
    return {
        "action": action,
        "risk_data": risk_result
    }
```

---

## Detection Capabilities

### 1. Claim Extraction
Breaks responses into atomic factual claims using simple sentence splitting.

**Example:**
```
Input: "SSN College stopped admissions in 2026 and is merging with SNU."
Output: 
  - "SSN College stopped admissions in 2026"
  - "SSN College is merging with SNU"
```

### 2. Overconfidence Detection
Flags absolute certainty language:
- "definitely", "guaranteed", "absolutely"
- "100%", "without doubt", "certainly"
- Confident advice in medical/legal/financial domains

### 3. Internal Contradiction Detection
Finds logical conflicts within the same response:
- Timeline conflicts: "introduced in 2022" vs "active since 2019"
- Status contradictions: "currently open" vs "has closed"
- Numerical inconsistencies

### 4. RAG Verification
Compares claims against retrieved documents:
- Keyword matching with context
- Contradiction detection near claim terms
- Coverage analysis (50%+ terms required for SUPPORTED)

---

## Testing

Run the test suite to verify functionality:

```bash
cd backend
python test_risk_engine.py
```

### Test Scenarios Included

1. ✅ Simple factual question (LOW risk)
2. ✅ Fictional event with overconfidence (HIGH risk)
3. ✅ Partially verifiable info (MEDIUM risk)
4. ✅ Medical advice with certainty (HIGH risk)
5. ✅ Internal contradiction (HIGH risk)
6. ✅ Graceful degradation without RAG
7. ✅ RAG contradiction detection
8. ✅ Edge case: empty response

---

## Design Principles

### 1. Risk, Not Truth
WATCHDOG estimates risk levels, not factual correctness. Even high-risk responses may be true.

### 2. Graceful Degradation
System works without RAG. Missing data results in UNVERIFIED status, not automatic blocking.

### 3. Explainability
Every risk score comes with human-readable explanations for transparency.

### 4. Separation of Concerns
WATCHDOG provides risk data only. Enforcement decisions (ALLOW/WARN/BLOCK) belong in your policy layer.

### 5. Production-Ready
- Deterministic detection
- No heavy NLP dependencies
- Fast execution
- Handles edge cases

---

## Utility Functions

```python
from risk_engine import (
    is_high_risk,
    is_medium_risk,
    is_low_risk,
    has_contradictions,
    has_unverified_claims,
    get_system_info,
)

# Risk level checks
if is_high_risk(result):
    print("High risk detected!")

# Signal checks
if has_contradictions(result):
    print("Contradictions found!")

# System metadata
info = get_system_info()
print(info['version'])  # "1.0.0"
print(info['risk_weights'])  # Weight configuration
```

---

## Configuration

Risk weights are hardcoded in [scorer.py](backend/risk_engine/scorer.py):

```python
RISK_WEIGHTS = {
    "internal_contradiction": 40,
    "rag_contradiction": 35,
    "rag_unverified": 15,
    "overconfidence": 20,
}
```

Modify these values to adjust sensitivity.

---

## Performance Characteristics

- **Speed**: ~10-50ms per analysis (depends on response length)
- **Memory**: Minimal footprint, no model loading
- **Dependencies**: Python standard library only
- **Scalability**: Stateless, can process requests in parallel

---

## Limitations & Future Work

### Current Limitations
- Simple keyword-based RAG matching (not semantic)
- Basic sentence splitting for claim extraction
- English language only
- No learning/adaptation over time

### Potential Enhancements
- Semantic similarity for RAG matching
- More sophisticated claim extraction (NLP)
- Multi-language support
- Configurable weight profiles
- Feedback loop for score calibration

---

## Integration Checklist

- [ ] Import `analyze` function into your backend
- [ ] Define your enforcement policy (score thresholds)
- [ ] Connect to your RAG system (if available)
- [ ] Test with your LLM outputs
- [ ] Add logging for risk events
- [ ] Set up admin dashboard to show explanations
- [ ] Monitor score distributions in production

---

## Support & Contact

For questions about WATCHDOG architecture or integration:

**Remember:** WATCHDOG is the intelligence layer. Enforcement decisions are your responsibility.

---

## Version

**Current Version:** 1.0.0

**Last Updated:** January 30, 2026

---

## License

Built for production AI safety systems.

**Core Philosophy:** 
> *"We don't decide what is true — we decide what is risky."*
