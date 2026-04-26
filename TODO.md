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

## Testing Checklist
- [ ] Test signup with matching passwords
- [ ] Test AdminAnalysis page load (no glitch)
- [ ] Test export JSON/CSV/TXT from ActivityLogs and AdminDashboard
- [ ] Verify timestamps show IST
- [ ] Test "Analyze All Prompts" tab with stored prompts

## README Update
- [x] Updated README.md with complete feature list capturing all app capabilities

