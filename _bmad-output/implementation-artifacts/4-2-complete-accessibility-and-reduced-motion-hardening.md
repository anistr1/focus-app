# Story 4.2: Complete Accessibility and Reduced-Motion Hardening

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an accessibility-sensitive user,
I want all major app surfaces to respect motion, contrast, and assistive needs,
so that the polished product remains comfortable and usable every day.

## Acceptance Criteria

1. Reduced-motion behavior is correctly applied across onboarding, timer, ritual, analytics, tray-start, and settings-related flows.
2. High-contrast, keyboard, and screen-reader behavior remain consistent across all shipped MVP surfaces.
3. Accessibility regressions introduced after Epic 1 are resolved before MVP signoff.
4. Accessibility hardening preserves the calm visual language rather than bypassing it.

## Tasks / Subtasks

- [x] Audit all shipped MVP surfaces for accessibility parity (AC: 1, 2, 3)
  - [x] Review onboarding, timer, breathing, analytics, tray-start, settings, and shell surfaces.
  - [x] Identify regressions against the Epic 1 accessibility baseline.
- [x] Complete reduced-motion coverage across all surfaces (AC: 1, 4)
  - [x] Ensure motion fallbacks are applied consistently where animation exists.
  - [x] Remove any remaining animation-dependent comprehension requirements.
- [x] Complete contrast, keyboard, and screen-reader hardening (AC: 2, 3)
  - [x] Verify focus treatment, semantics, and announcements across all MVP flows.
  - [x] Fix gaps introduced by later epic work.
- [x] Validate and document final accessibility readiness (AC: 3)
  - [x] Add checks or notes that make remaining limitations explicit if any exist.

## Dev Notes

- This is a cross-cutting hardening story, not a greenfield accessibility pass. Reuse and extend the baseline patterns from Story 1.6.
- The UX spec defines exact reduced-motion expectations for breathing, transitions, charts, and timer behavior. Use those as the source of truth.
- Preserve the product’s visual and emotional intent while improving accessibility. Do not “solve” accessibility by falling back to crude or inconsistent UI.
- Keep scope to shipped MVP surfaces; future post-MVP features are out of scope.

### Project Structure Notes

- Likely touch points:
  - shared UI primitives
  - onboarding, timer, breathing, analytics, settings, and tray-related surfaces
  - accessibility helpers/hooks
- Prefer fixing shared primitives where possible to reduce repeated regressions.

### References

- Story source and ACs: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- PRD accessibility and performance constraints: [windows_focus_app_prd.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md)
- Architecture D7 and Phase 4 polish guidance: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX accessibility strategy and motion fallbacks: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story contexts: Epic 1-3 story files, especially `1-6-deliver-accessibility-baseline-for-core-flows.md`

### Completion Notes List

- Story is explicitly cross-cutting and regression-oriented
- Epic 1 accessibility baseline remains the anchor
- Added shared reduced-motion hook and reused it across analytics, breathing ritual, and onboarding surfaces.
- Forced breathing ritual animation to minimal when OS reduced-motion preference is enabled.
- Hardened onboarding duration selector semantics with explicit pressed state and assistive labels.
- Added non-modal updater status region announcements (`role=\"status\"`, `aria-live=\"polite\"`) for screen-reader consistency.
- Added explicit static onboarding preview treatment for reduced-motion users.
- Validation: `node .\\node_modules\\typescript\\bin\\tsc --noEmit` and `node .\\node_modules\\vitest\\vitest.mjs run` (37 passing).

### File List

- _bmad-output/implementation-artifacts/4-2-complete-accessibility-and-reduced-motion-hardening.md
- src/features/accessibility/use-prefers-reduced-motion.ts
- src/components/analytics/AnalyticsCard.tsx
- src/components/breathing/BreathingRitualCard.tsx
- src/features/onboarding/OnboardingFlow.tsx
- src/components/updater/UpdateStatusCard.tsx
- src/styles/globals.css

