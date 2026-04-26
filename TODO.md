   # WATCHDOG Bug Fixes & Improvements — Progress Tracker

## Issues Fixed

1. **Signup "Passwords do not match" bug**
   - [x] `SignupPage.js` — Pass `confirmPassword` to `signup()` call
   - [x] `AuthContext.js` — Retain 3-param `signup(email, password, confirmPassword)` signature

2. **Dataset Audit clarity**
   - [x] `BiasAnalysisDashboard.js` — Updated "How To Use" description to explain Dataset Audit

3. **Bias analysis for all prompts**
   - [x] `BiasAnalysisDashboard.js` — Added "Analyze All Prompts" tab + `handleAnalyzeAllPrompts()` + `AnalyzeAllPromptsForm`
   - [x] `services/api.js` — `getAllPrompts` already available

4. **Download responses as JSON/CSV/TXT**
   - [x] `AdminDashboard.js` — Added export dropdown (JSON/CSV/TXT) for recent activity
   - [x] `ActivityLogs.js` — Added export dropdown (JSON/CSV/TXT) for filtered logs

5. **Dashboard click glitch**
   - [x] `AdminAnalysis.js` — Removed `prompts` from `useEffect` dependency array to stop infinite re-render loop
   - [x] `DataContext.js` — Wrapped `getPromptById` in `useCallback([])` so its reference stays stable and doesn't trigger the AdminAnalysis effect on every DataContext re-render

6. **IST timezone**
   - [x] `frontend/src/utils/timezone.js` — Created `toISTString()` helper
   - [x] `AdminAnalysis.js` — Replaced `toLocaleString()` with `toISTString()`
   - [x] `ActivityLogs.js` — Replaced `toLocaleString()` with `toISTString()`
   - [x] `UserChatPage.js` — Replaced `toLocaleTimeString()` with `toISTTimeString()`

7. **Sensitive topic detection (religion, caste, gender, mental health, manipulation)**
   - [x] `backend/risk_engine/signals.py` — Added `detect_sensitive_topic()` with keyword lists for religion, caste, gender, mental health, manipulation, stereotypes
   - [x] `backend/risk_engine/analyzer.py` — Wired `detect_sensitive_topic()` into `extract_all_signals()`; included results in returned dict
   - [x] `backend/risk_engine/scorer.py` — Added `sensitive_topic` to `RISK_WEIGHTS` (+30); updated `calculate_risk_score()`, `generate_explanation()`, `get_risk_breakdown()`, and `calculate_trust_score()` to account for sensitive topics
   - [x] `backend/app/proxy/enforcement.py` — Pass `sensitive_topic_detected`, `sensitive_topic_types`, `sensitive_topic_desc` through metadata and `get_enforcement_metadata()`
   - [x] `frontend/src/pages/AdminAnalysis.js` — Display "Sensitive Topic Detected" banner with topic tags when present

## Testing Checklist
- [x] Test signup with matching passwords
- [x] Test AdminAnalysis page load (no glitch)
- [x] Test export JSON/CSV/TXT from ActivityLogs and AdminDashboard
- [x] Verify timestamps show IST
- [x] Test "Analyze All Prompts" tab with stored prompts
- [x] Verify sensitive prompts (religion, caste, gender, mental health, manipulation) trigger WARN instead of ALLOW

## README Update
- [x] Updated README.md with complete feature list capturing all app capabilities

