# Story 3.2: Launch a Mini Ritual and Silent Background Focus Session

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user working from my desktop flow,
I want a compact tray-start ritual and silent focus launch,
so that I can enter focus mode without disrupting my workspace.

## Acceptance Criteria

1. Starting focus from the tray shows the compact 15-second mini ritual with immediate skip action.
2. The mini ritual appears without opening the full main window.
3. On completion or skip, the focus session starts in the background and the main window stays closed unless explicitly opened.
4. Reduced-motion and accessibility needs are respected during the tray-start ritual flow.

## Tasks / Subtasks

- [x] Add the tray-start mini ritual flow (AC: 1, 2)
  - [x] Create the compact ritual state and entry point triggered from tray start.
  - [x] Keep the main app window closed throughout the tray-start experience.
- [x] Implement the 15-second mini ritual behavior (AC: 1)
  - [x] Use the defined condensed cadence and immediate skip behavior.
  - [x] Reuse the breathing-domain concepts from Story 1.4 where possible.
- [x] Hand off into a silent background focus session (AC: 3)
  - [x] Start the focus session using the shared timer logic once the ritual completes or is skipped.
  - [x] Keep the background session aligned with main-app session state.
- [x] Apply accessibility and reduced-motion rules (AC: 4)
  - [x] Provide the reduced-motion fallback and keyboard-accessible skip behavior.
  - [x] Keep the tray-start interaction calm and unobtrusive.
- [x] Validate tray-start behavior and handoff correctness (AC: 1, 3, 4)
  - [x] Verify no unexpected window opening or state divergence occurs.

## Dev Notes

- This story builds on Story 3.1 tray action wiring and Story 1.4 breathing logic. Reuse those systems; do not build a separate ritual engine for tray mode.
- The UX spec defines this as a compact overlay above the tray icon, not a full-screen breathing screen. Preserve that distinction.
- The mini ritual is a separate UX from the full pre-focus ritual: shorter, lighter, and optimized for staying in flow.
- The background focus session must stay consistent with the same timer/session state the full app would show if opened later.
- Avoid any UX that steals focus aggressively from the user’s current desktop workflow.

### Project Structure Notes

- Likely touch points:
  - `src/features/tray/`
  - `src/features/breathing/`
  - `src/features/timer/`
  - `src-tauri/` if window/overlay behavior needs desktop-shell support
- Prefer a small tray-start coordinator that reuses existing breathing and timer logic.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD FR-04 and breathing context: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture tray-first and breathing-ritual decisions: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX Journey 2 mini-ritual definition and accessibility behavior: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 and Epic 2 story files, `3-1-control-focus-sessions-from-the-system-tray.md`

### Completion Notes List

- Story scopes to compact tray-start ritual and silent background launch only
- Reuse of full ritual and shared timer systems is a hard guardrail
- Added dedicated tray start route that triggers a compact 15-second mini ritual with immediate skip.
- Reused the existing breathing engine with compact rendering and forced minimal animation for tray-start accessibility.
- Preserved shared timer/session state by starting focus through existing timer-domain logic after mini ritual completion or skip.
- Validation: `node .\node_modules\vitest\vitest.mjs run` -> 33 passing.

### File List

- _bmad-output/implementation-artifacts/3-2-launch-a-mini-ritual-and-silent-background-focus-session.md
- src/components/timer/FocusTimerCard.tsx
- src/components/breathing/BreathingRitualCard.tsx
