# Story 1.4: Add the Full Breathing Ritual Experience

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user preparing to focus,
I want an optional guided breathing ritual before my session,
so that I can transition into deep work intentionally.

## Acceptance Criteria

1. Starting a focus session can route through an optional breathing ritual before the timer begins.
2. The ritual supports the approved preset durations and inhale, hold, and exhale phases.
3. The breathing circle follows the approved motion bounds and calm visual treatment.
4. Reduced-motion behavior and skip behavior remain accessible and unobtrusive.

## Tasks / Subtasks

- [x] Add breathing ritual state and session entry logic (AC: 1, 2)
  - [x] Add settings-aware routing so focus start can enter the ritual first.
  - [x] Support preset durations for 30 seconds, 1 minute, and 2 minutes.
- [x] Implement the ritual phase engine (AC: 2)
  - [x] Model inhale, hold, and exhale timing cleanly.
  - [x] Keep timing in sync with the visual state.
- [x] Build the ritual UI and breathing circle component (AC: 3)
  - [x] Use centered layout, soft gradients, and minimal controls.
  - [x] Keep the circle within the approved scale bounds.
- [x] Add accessibility, skip, and reduced-motion behavior (AC: 4)
  - [x] Support keyboard skip and calm transition into focus mode.
  - [x] Replace scale-heavy motion with opacity-oriented fallback where required.
- [x] Verify the timer handoff after ritual completion (AC: 1, 4)
  - [x] Ensure the focus session starts cleanly after completion or skip.

## Dev Notes

- The breathing ritual is a core product differentiator, not optional polish. The UX spec explicitly frames it as an accessibility and emotional-transition feature for the secondary persona.
- This story depends on Story 1.3’s timer start flow, but it must not redesign timer fundamentals. Build a clean pre-session stage that hands off to the timer state machine.
- Keep the ritual intentionally minimal: one main visual element, low noise, calm gradients, and no dashboard clutter.
- Respect the specified motion rules. The UX spec provides exact reduced-motion fallbacks and approved scale behavior.
- Do not implement tray mini-ritual behavior here; that belongs to Epic 3.

### Project Structure Notes

- Likely touch points:
  - `src/features/breathing/`
  - `src/components/breathing/`
  - timer entry orchestration in `src/features/timer/` or shared flow control
  - settings integration for enable/disable and duration choice
- Prefer a dedicated breathing component/service pair instead of embedding breathing logic in the timer UI.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD breathing ritual requirements and UX goals: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture D3, breathing modes, and main surfaces: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX motion specs and ritual journey details: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: `1-1-bootstrap-the-desktop-app-shell.md`, `1-2-complete-first-run-onboarding.md`, `1-3-run-a-reliable-focus-timer.md`

### Completion Notes List

- Story centers on the full ritual experience only, not tray mini-ritual or analytics tie-ins
- Timer handoff and reduced-motion behavior are explicit guardrails
- Added ritual-first focus start flow with a toggle to enable/disable ritual and preset duration selection (30s, 60s, 120s).
- Implemented dedicated breathing phase engine with inhale/hold/exhale cycle logic and deterministic phase lookup.
- Built a dedicated breathing ritual UI card with calm visuals, centered circle treatment, and unobtrusive skip control.
- Added keyboard skip support (Space/Escape) and ensured ritual completion or skip hands off cleanly into timer start.
- Added reduced-motion fallback behavior for breathing circle by replacing scale-heavy transforms with opacity-only treatment.
- Added/updated tests for breathing engine presets/phases and app-level ritual-before-focus flow with skip handoff.

### File List

- _bmad-output/implementation-artifacts/1-4-add-the-full-breathing-ritual-experience.md
- src/features/breathing/breathing-engine.ts
- src/features/breathing/breathing-engine.test.ts
- src/components/breathing/BreathingRitualCard.tsx
- src/components/timer/FocusTimerCard.tsx
- src/app/App.test.tsx
- src/styles/globals.css

### Change Log

- 2026-05-24: Implemented Story 1.4 full breathing ritual experience with phase engine, ritual UI, accessibility/skip behavior, reduced-motion fallback, and timer handoff; moved status to `review`.
