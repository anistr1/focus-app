# Story 4.1: Deliver Silent Background Updates Safely

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want the app to update quietly in the background,
so that I stay current without interruptions during focus sessions.

## Acceptance Criteria

1. The app can check for and prepare updates silently from the configured release source.
2. No disruptive modal appears during an active focus session.
3. Ready updates are surfaced with a subtle non-modal indication on the dashboard.
4. Update failures are safe, minimal, and non-blocking.

## Tasks / Subtasks

- [x] Integrate the updater flow with the configured release source (AC: 1, 4)
  - [x] Wire the approved Tauri updater path.
  - [x] Keep update checks and preparation silent in normal operation.
- [x] Prevent intrusive behavior during focus sessions (AC: 2)
  - [x] Gate update prompts or install affordances so they do not interrupt active focus flows.
  - [x] Reuse shared app/session state rather than inventing parallel session detection.
- [x] Add the subtle dashboard update indication (AC: 3)
  - [x] Surface update readiness with calm, non-modal UI.
  - [x] Keep the language and visual treatment aligned with product tone.
- [x] Add safe failure handling and validation (AC: 4)
  - [x] Ensure failed updates do not break the running app.
  - [x] Verify non-blocking feedback for failure paths where practical.

## Dev Notes

- The architecture assumes GitHub Releases for MVP updater hosting unless explicitly changed later.
- This story is about safe background update behavior, not a full software-updater UX overhaul.
- Do not interrupt active focus sessions with modal dialogs, restart demands, or alerting UX.
- Reuse the same “calm companion” tone used elsewhere in the app for any update surfaces.
- Keep updater logic contained to desktop-shell integration boundaries.

### Project Structure Notes

- Likely touch points:
  - `src-tauri/` for updater integration
  - app shell or dashboard surface for subtle update indication
  - shared session/app-state coordination
- Prefer a small updater service plus a dashboard signal instead of scattering updater logic across features.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD update strategy requirements: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture updater rules and hosting assumption: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX calm-feedback constraints: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1-3 story files

### Completion Notes List

- Story scoped to updater integration and safe user-facing behavior
- Interruptive update UX explicitly excluded
- Added silent updater hook that checks periodically and downloads available updates in the background.
- Added subtle non-modal dashboard indicator when an update is prepared and ready.
- Gated install affordance during active focus sessions by reusing shared timer status events.
- Added safe non-blocking failure copy for check/install paths so the app remains usable when updater operations fail.
- Validation: `node .\\node_modules\\typescript\\bin\\tsc --noEmit` and `node .\\node_modules\\vitest\\vitest.mjs run` (37 passing).

### File List

- _bmad-output/implementation-artifacts/4-1-deliver-silent-background-updates-safely.md
- src/features/updater/use-updater-state.ts
- src/components/updater/UpdateStatusCard.tsx
- src/features/timer/timer-events.ts
- src/components/timer/FocusTimerCard.tsx
- src/components/layout/AppShell.tsx
- package.json
- package-lock.json

