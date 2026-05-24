# Story 2.4: Export Local Telemetry Summary as JSON

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a privacy-conscious user,
I want to export my anonymized local usage summary,
so that I can review or share metrics without cloud syncing.

## Acceptance Criteria

1. The app can export the approved local telemetry summary as an anonymized JSON file.
2. The export contains only approved local metrics and excludes personal content, window titles, keystrokes, and active application data.
3. No automatic transmission occurs during or after export.
4. Success and failure feedback remains calm, non-technical, and non-blocking.

## Tasks / Subtasks

- [x] Define the export schema for approved local telemetry metrics (AC: 1, 2)
  - [x] Limit the schema to the MVP-approved anonymous metrics.
  - [x] Explicitly exclude disallowed data categories from the export path.
- [x] Implement local JSON export generation (AC: 1, 3)
  - [x] Build a local-only export action from Settings.
  - [x] Ensure the export does not trigger any network calls or background transmission.
- [x] Add user-facing export flow and feedback (AC: 4)
  - [x] Provide a calm success message and a non-blocking failure path.
  - [x] Keep the export action within the settings experience defined in Story 2.3.
- [x] Validate privacy constraints and export correctness (AC: 2, 3)
  - [x] Test representative output contents against the allowed/disallowed data rules.
  - [x] Confirm that export remains functional offline.

## Dev Notes

- The PRD and architecture are explicit: telemetry in MVP is local aggregation only, with optional user-initiated JSON export. There is no auto-send path.
- Export content should align with the approved metrics concepts: activation, retention-oriented local summaries, session completion, and related anonymous aggregates. Do not leak raw personal activity detail.
- This story depends on the telemetry preference and local usage tracking foundation established earlier. Reuse existing local metrics data structures instead of inventing a second telemetry model.
- Keep the UX simple. This is a privacy-respecting utility feature, not a reporting center.
- If the app uses Tauri file-system capabilities for export, keep the integration narrow and local-only.

### Project Structure Notes

- Likely touch points:
  - `src/features/settings/`
  - local telemetry aggregation modules under `src/services/`, `src/lib/`, or `src/database/`
  - Tauri-side file export integration if required
- Prefer a dedicated export function that consumes the local metrics model rather than coupling export generation to UI components.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD telemetry/privacy rules and export concept: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture local telemetry aggregation and settings export expectations: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX constraints for calm, non-technical feedback: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1 story files and Epic 2 story files through `2-3-manage-core-preferences-in-settings.md`
- Added dedicated `telemetry-export` module and schema tests validating disallowed fields are absent.
- Added settings export action and calm status feedback in the existing Settings surface.
- Full test suite run: `node .\node_modules\vitest\vitest.mjs run` (32 passing).

### Completion Notes List

- Story preserves strict local-only telemetry boundaries
- Export schema intentionally constrained to approved anonymous metrics
- Implemented local-only telemetry export summary generator using existing session analytics + settings model.
- Export uses JSON Blob download flow only; no network or background transmission path is introduced.
- UI keeps export in Settings with non-blocking, calm success/failure messaging.
- Privacy guardrails validated by tests asserting absent disallowed categories and identifiers.

### File List

- _bmad-output/implementation-artifacts/2-4-export-local-telemetry-summary-as-json.md
- src/features/settings/telemetry-export.ts
- src/features/settings/telemetry-export.test.ts
- src/components/settings/SettingsCard.tsx
- src/app/App.test.tsx
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-05-24: Added local-only anonymous telemetry JSON export flow in Settings with privacy validation tests; moved to review.
