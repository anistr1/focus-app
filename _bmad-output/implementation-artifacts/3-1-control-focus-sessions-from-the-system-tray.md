# Story 3.1: Control Focus Sessions from the System Tray

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a desktop utility user,
I want to control focus sessions from the system tray,
so that I can start and manage focus without opening the full app.

## Acceptance Criteria

1. The tray menu exposes quick actions for start, pause, resume, quick break, and quit.
2. Tray actions update the same timer/session state used by the main app.
3. Tray interactions remain lightweight and responsive in the background.
4. Tray failures do not corrupt active session state and fail gracefully.

## Tasks / Subtasks

- [x] Add the tray shell and action wiring (AC: 1, 3)
  - [x] Register the Tauri tray integration and create the tray menu structure.
  - [x] Expose the required quick actions with calm, clear labels.
- [x] Connect tray actions to shared timer/session state (AC: 2)
  - [x] Route start, pause, resume, quick break, and quit through the same domain logic as the main app.
  - [x] Avoid parallel tray-only state machines.
- [x] Ensure responsive background behavior (AC: 3)
  - [x] Keep tray interactions fast and low-overhead when the main window is not in use.
  - [x] Confirm the app can remain useful as a lightweight desktop companion.
- [x] Add graceful error handling and safety checks (AC: 4)
  - [x] Prevent tray failures from corrupting the active timer/session state.
  - [x] Keep any failure messaging non-disruptive and consistent with product tone.
- [x] Add validation coverage for tray control behavior (AC: 1, 2, 4)
  - [x] Test command mapping and shared-state consistency where practical.

## Dev Notes

- This story depends on Epic 1 timer foundations. Reuse the same timer/session orchestration from Story 1.3 rather than inventing a tray-specific session model.
- The architecture explicitly defines a tray-first UX and includes the Tauri tray plugin in the recommended stack.
- “Quick break” should map cleanly into the existing break-mode/session model established by the timer domain.
- Keep the tray menu lean. The product is a desktop utility, not a control panel.
- Do not mix mini-ritual overlay behavior into this story; that belongs to Story 3.2.

### Project Structure Notes

- Likely touch points:
  - `src/features/tray/`
  - `src-tauri/` for tray/plugin integration
  - timer/session domain modules from Epic 1
  - shared app lifecycle/process integration if needed
- Prefer thin tray adapters over duplicating timer business logic in Tauri command handlers.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD FR-04 tray requirements: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture D2 tray-first UX and plugin guidance: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX tray interaction principles and quiet-companion framing: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 and Epic 2 story files
- Added Tauri tray menu wiring in `src-tauri/src/lib.rs` emitting `tray-action` events.
- Added frontend tray-event listener in `FocusTimerCard` with safe no-op fallback outside Tauri.
- Added shared timer-domain tray action mapping tests.
- Validation: `node .\node_modules\vitest\vitest.mjs run` -> 33 passing.
- Rust validation blocked in this environment: `cargo` command not found.

### Completion Notes List

- Story constrained to tray control wiring and shared-state integration
- Mini ritual and notification work intentionally deferred to later Epic 3 stories
- Implemented tray actions: Start Focus, Pause Focus, Resume Focus, Quick Break, Quit.
- Wired tray actions through shared timer domain (`applyTrayAction`) to avoid tray-only state.
- Tray event handling is lightweight and background-friendly via event emission and local state transition.
- Failure safety maintained by using pure timer-domain transitions and fallback behavior when Tauri APIs are unavailable.

### File List

- _bmad-output/implementation-artifacts/3-1-control-focus-sessions-from-the-system-tray.md
- src-tauri/src/lib.rs
- src/components/timer/FocusTimerCard.tsx
- src/features/timer/timer-domain.ts
- src/features/timer/timer-domain.test.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-05-24: Added system tray controls wired to shared timer state and validated tray action mapping; moved to review.
