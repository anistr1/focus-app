# Story 3.3: Deliver Native Notifications for Focus Events

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user relying on ambient reminders,
I want native Windows notifications for important focus events,
so that I stay informed without having to watch the timer constantly.

## Acceptance Criteria

1. The app shows native Windows notifications for session completion, break completion, streak milestones, and inactivity reminders.
2. Notifications stay non-intrusive and do not disrupt active focus sessions with aggressive UI.
3. When notifications are blocked, the app provides calm in-app guidance and the intended route to system settings.
4. Notification behavior remains aligned with local app state and product tone.

## Tasks / Subtasks

- [x] Implement native notification dispatch for approved focus events (AC: 1, 4)
  - [x] Wire session completion, break completion, streak milestone, and inactivity reminders into the notification layer.
  - [x] Use the approved Tauri notification path for Windows-native behavior.
- [x] Keep notification delivery calm and non-disruptive (AC: 2, 4)
  - [x] Avoid interruptive modals or focus-stealing behavior during active sessions.
  - [x] Keep copy and timing aligned with the product’s calm emotional tone.
- [x] Add blocked-notification guidance flow (AC: 3)
  - [x] Detect or handle the case where notifications are unavailable.
  - [x] Surface a soft warning and the route to Windows notification settings.
- [x] Validate notification triggers and state consistency (AC: 1, 2, 4)
  - [x] Ensure notifications reflect the actual timer/session state and are not duplicated unexpectedly.
  - [x] Test representative event paths where practical.

## Dev Notes

- This story depends on timer/session completion flows from Epic 1 and the local analytics/streak data from Epic 2 for milestone-related notifications.
- The architecture and PRD both call for native Windows toasts, not custom in-app pseudo-toasts as the primary mechanism.
- The UX spec is strict about tone: notifications should feel supportive, not urgent or competitive.
- Keep blocked-notification handling soft and helpful. Do not block the app or force system changes.
- Update-ready notifications belong primarily to Epic 4’s updater work; this story focuses on focus-session event notifications.

### Project Structure Notes

- Likely touch points:
  - `src/features/tray/` or a dedicated notifications feature/service
  - `src/services/` for notification dispatch and event coordination
  - `src-tauri/` for notification plugin wiring
  - timer/session/analytics domains as event sources
- Prefer a centralized notification service that subscribes to domain events instead of scattering notification logic across UI components.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD FR-05 notification types and tone: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture native-notification guidance and plugin stack: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX feedback patterns and blocked-notification handling: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 and Epic 2 story files, Epic 3 stories `3-1` and `3-2`

### Completion Notes List

- Story centered on focus-event notifications only
- Updater-specific notifications intentionally deferred to Epic 4
- Added centralized notification service with Tauri native path and browser Notification fallback.
- Wired event notifications for focus completion, break completion, streak milestones, and inactivity reminders.
- Added calm blocked-notification guidance with route to `Windows Settings > System > Notifications`.
- Maintained shared timer/session state as source of truth and avoided focus-stealing behavior.
- Validation: `node .\\node_modules\\vitest\\vitest.mjs run` -> 37 passing.

### File List

- _bmad-output/implementation-artifacts/3-3-deliver-native-notifications-for-focus-events.md
- src/components/timer/FocusTimerCard.tsx
- src/features/notifications/notification-service.ts
- src/features/notifications/notification-service.test.ts
- package.json
- package-lock.json

