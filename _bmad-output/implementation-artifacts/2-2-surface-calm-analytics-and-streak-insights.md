# Story 2.2: Surface Calm Analytics and Streak Insights

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a habit-building user,
I want clear analytics and streak insights,
so that I can reflect on my progress without feeling pressured.

## Acceptance Criteria

1. The analytics view shows daily focus time, weekly trends, streaks, monthly totals, and completion history based on local session data.
2. Analytics visuals follow the approved calm visual style and avoid pressure-inducing or gamified treatment.
3. Reduced-motion behavior is respected in analytics rendering.
4. Calculations remain accurate as new session data is recorded.

## Tasks / Subtasks

- [x] Build analytics calculations from local session history (AC: 1, 4)
  - [x] Derive daily totals, weekly trends, streaks, monthly totals, and completion-history summaries.
  - [x] Keep the calculation layer reusable and isolated from chart UI.
- [x] Implement the analytics view and core components (AC: 1, 2)
  - [x] Render the required metrics and charts with calm hierarchy and low clutter.
  - [x] Reuse shared design tokens and chart components where possible.
- [x] Add reduced-motion support to analytics transitions (AC: 3)
  - [x] Disable or simplify chart draw animations when reduced motion is enabled.
  - [x] Ensure readability remains intact without animation.
- [x] Tune copy and visual emphasis for supportive reflection (AC: 2)
  - [x] Avoid competitive language, alerting styles, and guilt-oriented framing.
  - [x] Keep streak presentation subtle and informative.
- [x] Add test coverage for analytics calculations and key rendering behavior (AC: 1, 4)
  - [x] Validate calculation correctness against representative session-history fixtures.

## Dev Notes

- This story depends on the completed-session data model from Story 2.1. Build analytics on top of persisted local history, not parallel in-memory-only counters.
- The UX spec is explicit that analytics must feel calm and reflective. The goal is “gentle self-awareness,” not gamification.
- Recharts is the chosen charting library from the PRD/architecture stack. Use it if available in the scaffold; do not introduce a different charting system without a documented reason.
- Reduced motion is not optional. Chart animations must degrade cleanly or be removed under `prefers-reduced-motion`.
- Keep analytics local-only. No upload, remote sync, or hidden instrumentation belongs here.

### Project Structure Notes

- Likely touch points:
  - `src/features/analytics/`
  - `src/components/charts/`
  - `src/database/` or `src/services/` for analytics query/calculation helpers
  - shared dashboard or app-surface components
- Prefer a clean analytics service or selector layer over mixing calculations inside chart components.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD FR-03, motion standards, and non-gamified analytics intent: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture analytics view and development-phase expectations: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX analytics journey, motion specs, and emotional constraints: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 story files and `2-1-record-completed-sessions-and-show-session-history.md`
- Added analytics summary domain tests and analytics card rendering/reduced-motion tests.
- Full test suite run: `node .\node_modules\vitest\vitest.mjs run` (25 passed).

### Completion Notes List

- Story centers on calculation correctness and calm presentation
- Charting stack constrained by approved architecture
- Implemented reusable analytics summary builder in `src/features/analytics/analytics-summary.ts`.
- Added `AnalyticsCard` with daily/monthly totals, weekly rhythm bars, streak metrics, and supportive copy.
- Added reduced-motion behavior by disabling bar-height transitions when `prefers-reduced-motion` is enabled.
- Integrated analytics card into `AppShell` and styled weekly trend bars in shared styles.
- Verified with new analytics tests and existing regression suite.

### File List

- _bmad-output/implementation-artifacts/2-2-surface-calm-analytics-and-streak-insights.md
- src/features/analytics/analytics-summary.ts
- src/features/analytics/analytics-summary.test.ts
- src/components/analytics/AnalyticsCard.tsx
- src/components/analytics/AnalyticsCard.test.tsx
- src/components/layout/AppShell.tsx
- src/styles/globals.css
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-05-24: Implemented calm analytics summary + UI, reduced-motion handling, and full analytics test coverage; story moved to review.
