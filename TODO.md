# Task: Fix Frontend Navigation & Backend LLM Configuration

## Summary
Fix navigation sidebar consistency across admin pages and change backend to use real Gemini LLM instead of defaulting to mock mode.

## Completed Steps

- [x] Created shared `AdminLayout.js` component with 8 navigation items
- [x] Created 4 new admin page components: `WhatIfScenarios`, `ImpactDashboard`, `ExplainabilityDashboard`, `CommunityHub`
- [x] Fixed `App.js` to include routes for all new admin pages
- [x] Expanded `AdminDashboard.js` sidebar to 8 items (Dashboard, Current Prompt, Bias Analysis, What-If, Impact, Explainability, Community, Logs)
- [x] Expanded `AdminAnalysis.js` sidebar to match
- [x] Expanded `ActivityLogs.js` sidebar to match
- [x] Restored `BiasAnalysisDashboard.js` to clean working state
- [x] Fixed backend `llm_proxy.py`: default `MOCK_LLM` changed from `true` to `false`
- [x] Fixed backend `llm_proxy.py`: now reads both `GEMINI_API_KEY` and `GOOGLE_GENERATIVEAI_API_KEY`

## What was fixed

| File | Issue | Fix |
|---|---|---|
| `frontend/src/components/AdminLayout.js` | Did not exist | Created shared layout with 8 nav items |
| `frontend/src/pages/WhatIfScenarios.js` | Did not exist | Created |
| `frontend/src/pages/ImpactDashboard.js` | Did not exist | Created |
| `frontend/src/pages/ExplainabilityDashboard.js` | Did not exist | Created |
| `frontend/src/pages/CommunityHub.js` | Did not exist | Created |
| `frontend/src/App.js` | Missing routes | Added 4 new routes |
| `frontend/src/pages/AdminDashboard.js` | Only 2 sidebar items | Expanded to 8 |
| `frontend/src/pages/AdminAnalysis.js` | Only 2 sidebar items | Expanded to 8 |
| `frontend/src/pages/ActivityLogs.js` | Only 2 sidebar items | Expanded to 8 |
| `frontend/src/pages/BiasAnalysisDashboard.js` | Duplicate imports | Cleaned up |
| `backend/app/proxy/llm_proxy.py` | Mock LLM default true | Changed to false |
| `backend/app/proxy/llm_proxy.py` | Only read GEMINI_API_KEY | Now reads both env var names |

## Next Steps
1. Set `GOOGLE_GENERATIVEAI_API_KEY` in environment for production
2. Test navigation between all admin pages
3. Verify Gemini API responses are working
