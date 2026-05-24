# Story 2.1: Record Completed Sessions and Show Session History

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a returning user,
I want my completed focus sessions stored and visible,
so that I can review my recent work and build a sense of consistency.

## Acceptance Criteria

1. Completed focus sessions are stored locally with duration, completion state, and timestamp.
2. The user can view recent sessions, total focus time, completed sessions, and average session length from the app.
3. The history presentation remains minimal, readable, and offline-first.
4. Empty history states are calm and avoid guilt-inducing or noisy messaging.

## Tasks / Subtasks

- [x] Extend local persistence for completed session records (AC: 1)
  - [x] Define the session data shape and storage path using the persistence foundation from Epic 1.
  - [x] Save completed focus-session outcomes without introducing cloud sync or remote reporting.
- [x] Connect timer completion to session persistence (AC: 1)
  - [x] Ensure focus-session completion writes a usable history record.
  - [x] Avoid duplicate or partial writes from retries or interrupted flows.
- [x] Build the session history UI surface (AC: 2, 3, 4)
  - [x] Show recent sessions, total focus time, completed sessions, and average session length.
  - [x] Keep the visual treatment calm, minimal, and readable.
- [x] Implement empty-state and error-state handling (AC: 3, 4)
  - [x] Add a calm empty state for users with no session records.
  - [x] Keep any failure feedback non-blocking and aligned with product tone.
- [x] Add validation coverage for session persistence and display (AC: 1, 2)
  - [x] Test record creation, summary calculations, and first-use empty behavior where practical.

## Dev Notes

- This story builds directly on Story 1.3 timer completion and Story 1.5 persistence/recovery work. Reuse those flows instead of introducing a second session-tracking mechanism.
- Scope here is history capture and display only. Streaks, weekly trends, and broader analytics belong in Story 2.2.
- Maintain the offline-first model. Session records stay local and should not depend on any network connectivity.
- The UX spec treats history and reflection as supportive, not judgmental. Avoid “you did nothing” style copy and aggressive streak language on this surface.
- If the persistence layer already has session checkpoint state from Story 1.5, separate active-session recovery data from completed-session history cleanly.

### Project Structure Notes

- Likely touch points:
  - `src/features/sessions/`
  - `src/database/` for session persistence schema/adapters
  - `src/components/` for session history and summary rendering
  - timer completion wiring from `src/features/timer/`
- Prefer a dedicated session repository/service over embedding persistence logic in UI components.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD FR-02 and analytics-supporting session requirements: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture session-history and dashboard expectations: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX emphasis on calm reflection and empty states: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 story files in `_bmad-output/implementation-artifacts/`

### Completion Notes List

- Story limited to completed-session recording and session-history display
- Analytics calculations intentionally deferred except for direct history summaries
- Added dedicated local session-history repository in `src/features/sessions/session-history.ts` with strict local shape validation, write deduplication via completion key, capped record list, and summary calculations.
- Wired timer completion transition to session recording in `FocusTimerCard` so completed focus/break runs persist exactly once per completion key.
- Added real session history UI (`SessionHistoryCard`) showing recent sessions, total focus minutes, completed count, and average session length.
- Added calm empty-state copy for first-use history and kept all persistence offline-only with local storage.
- Added test coverage for session record creation, duplicate suppression, summary math, and app-level empty-state behavior.
- Note on validations: Vitest commands report passing suites/tests; command runner hit timeout boundary after output emission during long test-environment teardown.

### File List

- _bmad-output/implementation-artifacts/2-1-record-completed-sessions-and-show-session-history.md
- src/features/sessions/session-history.ts
- src/features/sessions/session-history.test.ts
- src/components/sessions/SessionHistoryCard.tsx
- src/components/layout/AppShell.tsx
- src/components/timer/FocusTimerCard.tsx
- src/app/App.test.tsx

### Change Log

- 2026-05-24: Implemented Story 2.1 local completed-session persistence and in-app session history surface with calm empty state; moved status to `review`.
