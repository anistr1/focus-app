# Story 1.3: Run a Reliable Focus Timer

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a focus user,
I want to start, pause, stop, reset, and complete focus sessions reliably,
so that I can trust the timer during real work.

## Acceptance Criteria

1. The timer supports start, pause, resume, stop, reset, and break-mode entry points.
2. Timer state is calculated using timestamps rather than interval-only drift-prone logic.
3. Minimize, backgrounding, sleep, and resume preserve correct remaining time.
4. Long-running or inconsistent timer states fail calmly and do not corrupt the session experience.

## Tasks / Subtasks

- [x] Implement the core timer domain model and state machine (AC: 1, 2)
  - [x] Define focus and break session states.
  - [x] Implement controls for start, pause, resume, stop, and reset.
- [x] Implement timestamp-based timing logic (AC: 2, 3)
  - [x] Use target-time/current-time calculations rather than trusting interval ticks.
  - [x] Ensure resume after minimize or sleep recalculates remaining time correctly.
- [x] Build the first timer surface and controls (AC: 1, 4)
  - [x] Create a readable, stable timer UI with minimal controls.
  - [x] Keep visuals calm and avoid stressful motion.
- [x] Handle defensive edge cases (AC: 3, 4)
  - [x] Add calm handling for inconsistent state and extended sessions.
  - [x] Avoid data corruption or broken timer loops.
- [x] Add tests for timer correctness (AC: 1, 2, 3)
  - [x] Cover timing math and transitions.
  - [x] Cover minimize/sleep/resume style scenarios where feasible at the unit/service layer.

## Dev Notes

- This story is the timer engine foundation for the entire product. Get the state model and timestamp math right before attaching tray, notifications, or analytics stories.
- The PRD and architecture both explicitly forbid relying only on `setInterval`. Use intervals only as a rendering or polling helper if needed; session truth must come from timestamps.
- Do not overbuild persistence here. Full recovery persistence belongs with Story 1.5, though the timer API should be designed to allow checkpointing later.
- Keep the timer surface consistent with the UX spec: readable, immersive, centered, and calm. No noisy ticking or aggressive motion.
- Break mode is in scope as an entry point and timer state. Detailed session history/analytics are not.

### Project Structure Notes

- Likely touch points:
  - `src/features/timer/`
  - `src/components/timer/`
  - `src/stores/` for timer state if using Zustand
  - `src/lib/` or `src/services/` for time calculations
- Build reusable timer logic in a service/domain layer rather than embedding timing behavior directly in UI components.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- Timer logic requirements and product constraints: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture decision D4 and focus session screen guidance: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX timer experience and feedback patterns: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: `1-1-bootstrap-the-desktop-app-shell.md`, `1-2-complete-first-run-onboarding.md`

### Completion Notes List

- Story focuses on correct timer behavior and first usable timer surface
- Persistence beyond immediate runtime intentionally deferred to Story 1.5
- Implemented a timer domain module with explicit focus/break modes and state transitions for start, pause, resume, stop, reset, completion, and defensive error state.
- Implemented timestamp-driven remaining-time calculations and runtime ticking where interval updates only refresh UI while timer truth derives from target timestamps.
- Added calm defensive handling for over-extended sessions (auto-fail into non-corrupt error state with user-facing calm message).
- Replaced shell placeholder with first timer surface including readable timer, mode selection, and minimal controls.
- Added unit tests for state transitions and timestamp math including resume after large time jumps; added app integration test for timer control visibility.

### File List

- _bmad-output/implementation-artifacts/1-3-run-a-reliable-focus-timer.md
- src/features/timer/timer-domain.ts
- src/features/timer/timer-domain.test.ts
- src/components/timer/FocusTimerCard.tsx
- src/components/layout/AppShell.tsx
- src/app/App.test.tsx

### Change Log

- 2026-05-24: Implemented Story 1.3 timer domain + first timer UI with timestamp logic, defensive handling, and tests; moved status to `review`.
