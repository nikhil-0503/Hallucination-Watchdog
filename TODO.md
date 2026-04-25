# WATCHDOG UI/UX Redesign TODO

## Critical Issues Found
1. **AdminLayout nav items** have hardcoded `color: '#000'` and light backgrounds on dark theme → text invisible
2. **ActivityLogs & AdminAnalysis** duplicate sidebar inline instead of using AdminLayout
3. **BiasAnalysis, WhatIf, Impact, Explainability, CommunityHub** use Bootstrap classes (`card shadow-lg`, `bg-primary`, `container mt-5`) that don't match dark theme
4. **Font Awesome icons** (`fas fa-*`) used without guarantee of loading → broken icons
5. **Hardcoded static data** in ImpactDashboard, ExplainabilityDashboard, CommunityHub
6. **Wrong nav paths** in duplicated sidebars (`/admin/bias` instead of `/admin/bias-analysis`)

## Plan

### Phase 1: Foundation (CSS + Layout)
- [ ] Create `watchdog-ui.css` — unified admin page stylesheet replacing Bootstrap
- [ ] Fix `AdminLayout.js` — proper CSS variables, no hardcoded styles, mobile responsive
- [ ] Fix `design-system.css` — ensure consistency

### Phase 2: Auth Pages
- [ ] Rewrite `LoginPage.js` — Lucide icons, proper theme, dynamic form
- [ ] Rewrite `SignupPage.js` — Lucide icons, proper theme

### Phase 3: User Pages
- [ ] Rewrite `UserChatPage.js` — Lucide icons, dynamic messages, proper theme

### Phase 4: Admin Pages (use AdminLayout properly)
- [ ] Rewrite `AdminDashboard.js` — ensure dynamic data, proper styling
- [ ] Rewrite `ActivityLogs.js` — use AdminLayout, remove duplicated sidebar
- [ ] Rewrite `AdminAnalysis.js` — use AdminLayout, remove duplicated sidebar
- [ ] Rewrite `BiasAnalysisDashboard.js` — remove Bootstrap, dynamic API calls
- [ ] Rewrite `WhatIfScenarios.js` — remove Bootstrap, dynamic simulation
- [ ] Rewrite `ImpactDashboard.js` — remove Bootstrap, dynamic metrics from API
- [ ] Rewrite `ExplainabilityDashboard.js` — remove Bootstrap, dynamic
- [ ] Rewrite `CommunityHub.js` — remove Bootstrap, dynamic

### Phase 5: Build & Deploy
- [ ] npm run build (frontend)
- [ ] Fix any build errors
- [ ] Test all routes
- [ ] Git commit & push
- [ ] Deploy

