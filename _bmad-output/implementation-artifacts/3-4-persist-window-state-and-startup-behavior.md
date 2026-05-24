# Story 3.4: Persist Window State and Startup Behavior

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a frequent user,
I want the app to remember how I use it on Windows,
so that reopening the app feels instant and native.

## Acceptance Criteria

1. Window size, position, and last state persist across close and reopen cycles.
2. Startup-launch preference is stored and correctly applied to Windows autostart behavior.
3. When auto-launch is enabled, the app starts in the intended lightweight state without disrupting the desktop.
4. The implementation preserves local-first behavior and calm window UX.

## Tasks / Subtasks

- [x] Implement window-state persistence (AC: 1, 4)
  - [x] Wire the approved window-state plugin or equivalent persistence path.
  - [x] Restore saved size, position, and last state on reopen.
- [x] Connect startup preference to real autostart behavior (AC: 2)
  - [x] Reuse the startup-related settings stored in Story 2.3.
  - [x] Apply them through the approved autostart integration.
- [x] Define and implement the lightweight auto-launch behavior (AC: 3, 4)
  - [x] Ensure the app opens in the intended non-disruptive state when Windows starts.
  - [x] Avoid stealing focus or forcing immediate user interaction.
- [x] Validate persistence and startup behavior across restarts (AC: 1, 2, 3)
  - [x] Confirm saved window state restores correctly.
  - [x] Confirm autostart enable/disable transitions behave consistently.

## Dev Notes

- This story finishes the system integration implied by Story 2.3’s stored startup preference.
- The architecture recommends Tauri window-state and autostart plugins. Reuse those rather than homegrown OS-specific hacks where possible.
- “Lightweight state” should align with the product’s utility posture: no disruptive full-screen launch, no forced onboarding-like interruptions, no unnecessary heavy initialization.
- Keep all behavior local. Autostart is OS integration, not a cloud/user-account concept.
- Avoid breaking tray-first behavior; auto-launch and window restore should still work coherently with the desktop companion model.

### Project Structure Notes

- Likely touch points:
  - `src-tauri/` for autostart and window-state integration
  - settings persistence/application paths from Story 2.3
  - app shell/window lifecycle coordination
- Prefer a single lifecycle/window coordinator for startup and restore behavior instead of scattered one-off handlers.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD Windows-specific window and startup requirements: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture startup launch, window state persistence, and plugin guidance: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX requirement for stable, native-feeling reopen behavior: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 and Epic 2 story files, Epic 3 stories `3-1` through `3-3`

### Completion Notes List

- Story connects persisted startup preference to actual Windows behavior
- Window state and autostart kept within the desktop-shell integration boundary
- Added desktop lifecycle coordinator to sync `launchOnStartup` setting with Tauri autostart plugin enable/disable.
- Added close-request interception that honors `minimizeToTrayOnClose` by hiding the window instead of exiting.
- Added lightweight autostart launch behavior by passing `--autostart` argument and hiding the main window on autostart boot.
- Continued relying on Tauri window-state plugin for size/position/state persistence across reopen cycles.
- Validation: `node .\\node_modules\\typescript\\bin\\tsc --noEmit` and `node .\\node_modules\\vitest\\vitest.mjs run` (37 passing).

### File List

- _bmad-output/implementation-artifacts/3-4-persist-window-state-and-startup-behavior.md
- src/features/desktop/use-desktop-lifecycle.ts
- src/components/layout/AppShell.tsx
- src-tauri/src/lib.rs
- src/features/settings/settings-state.ts
- package.json
- package-lock.json

