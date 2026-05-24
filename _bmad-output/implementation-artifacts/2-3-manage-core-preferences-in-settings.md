# Story 2.3: Manage Core Preferences in Settings

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user with personal focus preferences,
I want to adjust key app settings,
so that the app fits my workflow without friction.

## Acceptance Criteria

1. Settings allow management of timer durations, sounds, notifications, breathing preferences, animation intensity, telemetry preference, and startup-related preferences intended for the product.
2. Updated preferences persist locally and apply to the relevant app behavior.
3. The settings surface remains low-density, easy to navigate, and consistent with the existing accessibility baseline.
4. Settings behavior remains offline-first and does not block the main focus workflow.

## Tasks / Subtasks

- [x] Build the settings surface and information architecture (AC: 1, 3)
  - [x] Create the settings modal or surface aligned with the UX spec.
  - [x] Group controls in a way that stays low-density and scannable.
- [x] Implement core preference controls and persistence (AC: 1, 2, 4)
  - [x] Wire timer, sound, notification, breathing, animation, telemetry, and startup-related settings to local persistence.
  - [x] Reuse state already introduced in onboarding and Epic 1 flows.
- [x] Apply settings to downstream behavior (AC: 2)
  - [x] Ensure changed preferences affect timer, breathing, motion, and relevant app surfaces correctly.
  - [x] If startup-related preferences are stored before Epic 3 behavior wiring is complete, keep storage compatible with later system integration.
- [x] Preserve accessibility and calm navigation (AC: 3)
  - [x] Ensure keyboard navigation, focus treatment, contrast, and labeling remain consistent with Story 1.6.
- [x] Add validation for settings persistence and behavioral application (AC: 2, 4)
  - [x] Cover representative setting changes and rehydration across relaunch where practical.

## Dev Notes

- This story includes storing startup-related preferences, but actual Windows autostart behavior is implemented in Epic 3. Keep the data model and UI compatible with that later integration.
- Reuse onboarding defaults and telemetry preference paths instead of creating duplicate state for the same concepts.
- Settings should remain modal-based and low density per the UX spec, not a sprawling admin panel.
- Do not let this story absorb export logic from Story 2.4 or system tray concerns from Epic 3.
- Keep all settings local. No account sync or server-backed preference storage.

### Project Structure Notes

- Likely touch points:
  - `src/features/settings/`
  - `src/components/ui/` and `src/components/layout/`
  - shared persistence modules under `src/database/`, `src/services/`, or `src/stores/`
- Prefer a normalized settings model and shared persistence adapter over ad hoc per-control storage.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD FR-06 and settings scope: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture settings surface and app-state expectations: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX settings modal, shortcuts discoverability, and accessibility patterns: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 story files, `2-1-record-completed-sessions-and-show-session-history.md`, `2-2-surface-calm-analytics-and-streak-insights.md`
- Added normalized `settings-state` module with onboarding-derived defaults and local persistence.
- Updated timer flow to consume persisted settings and react to `SETTINGS_UPDATED_EVENT`.
- Full suite validation: `node .\node_modules\vitest\vitest.mjs run` -> 29 passing tests.

### Completion Notes List

- Story explicitly separates preference storage from later Epic 3 autostart system wiring
- Scope constrained to settings UI, persistence, and application of preferences
- Implemented `SettingsCard` surface covering timer, sound, notifications, breathing, animation, telemetry, and startup preferences.
- Persisted startup-related preferences locally in a compatible model for future Epic 3 system wiring.
- Applied settings to downstream behaviors: timer durations, breathing enablement/duration, and breathing animation intensity.
- Preserved calm, low-density controls with accessible labels and keyboard-friendly form elements.
- Added settings persistence tests plus app-level behavior tests for rehydration and timer effect.

### File List

- _bmad-output/implementation-artifacts/2-3-manage-core-preferences-in-settings.md
- src/features/settings/settings-state.ts
- src/features/settings/settings-state.test.ts
- src/components/settings/SettingsCard.tsx
- src/components/layout/AppShell.tsx
- src/components/timer/FocusTimerCard.tsx
- src/components/breathing/BreathingRitualCard.tsx
- src/styles/globals.css
- src/app/App.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-05-24: Implemented core settings surface, local persistence, behavior wiring, and validation tests; moved to review.
