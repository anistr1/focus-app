# Story 1.2: Complete First-Run Onboarding

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a first-time user,
I want a guided onboarding flow,
so that I can configure the app and reach my first focus session quickly.

## Acceptance Criteria

1. First launch shows the five required onboarding steps: welcome, default duration, telemetry choice, breathing demo, and timer-ready.
2. Skippable steps behave according to the UX spec, while telemetry remains an explicit choice.
3. Onboarding state and selections persist locally and the flow does not repeat after completion.
4. The final step transitions the user into the main app experience and includes shortcut discoverability guidance.

## Tasks / Subtasks

- [x] Build the onboarding flow container and step sequencing (AC: 1)
  - [x] Create the first-run gate that routes new users into onboarding.
  - [x] Implement the five required steps in the correct order.
- [x] Implement step behaviors and UX constraints (AC: 2, 4)
  - [x] Add skip handling only where allowed by the UX spec.
  - [x] Add back navigation where specified.
  - [x] Include the timer-ready shortcut tip on completion.
- [x] Persist onboarding state and user selections locally (AC: 3)
  - [x] Store onboarding completion, default duration, and telemetry choice in local persistence.
  - [x] Ensure reopened sessions bypass onboarding once complete.
- [x] Align the onboarding visuals with the approved experience (AC: 1, 2, 4)
  - [x] Use centered full-screen card treatment, low-density layout, and calm motion.
  - [x] Ensure reduced-motion and keyboard accessibility work from day one.

## Dev Notes

- Story 1.1 should establish the shell, local persistence entry points, and design-system primitives this story builds on.
- The onboarding flow is not just a modal; the UX spec defines it as a linear five-step first-run experience and the architecture persists it via app state.
- Telemetry remains local-only in MVP. The onboarding toggle is an explicit consent choice for local aggregation/export behavior, not network analytics.
- Keep onboarding completion under the product’s “under 2 minutes” intent by avoiding extra steps or hidden branching.
- Do not let this story drift into full timer implementation; it only needs to hand off cleanly to the main app surface and demo breathing.

### Project Structure Notes

- Likely touch points:
  - `src/app/` or equivalent app routing entry
  - `src/features/onboarding/` if you create a dedicated feature folder
  - `src/components/layout/` and shared UI primitives
  - local persistence modules under `src/database/` or `src/services/`
- Keep onboarding state local and lightweight; do not introduce remote state or background services.

### References

- Story source and acceptance criteria: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- Onboarding database state, flow order, and architecture expectations: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX details for Journey 0, skip rules, card treatment, and shortcut tip: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Prior story context: `1-1-bootstrap-the-desktop-app-shell.md`

### Completion Notes List

- Story scope constrained to first-run onboarding flow and persistence
- Accessibility and reduced-motion requirements included because Epic 1 cannot retrofit them later
- Added first-run route gate in `App` that checks local onboarding completion and sends new users through a five-step onboarding flow.
- Implemented ordered onboarding steps with UX constraints: skip shown only on allowed steps, back shown from step 2 onward, telemetry explicit-choice gate, and timer-ready shortcut discoverability tip.
- Persisted onboarding completion, default duration, and telemetry selection in local storage, and bypass onboarding for returning users.
- Added onboarding breathing preview motion with reduced-motion fallback behavior.
- Added automated tests covering step order, skip/back constraints, telemetry explicit choice, persistence, and first-run bypass behavior.

### File List

- _bmad-output/implementation-artifacts/1-2-complete-first-run-onboarding.md
- src/app/App.tsx
- src/app/App.test.tsx
- src/features/onboarding/OnboardingFlow.tsx
- src/features/onboarding/onboarding-state.ts
- src/styles/globals.css

### Change Log

- 2026-05-24: Implemented Story 1.2 onboarding flow, persistence, and test coverage; moved status to `review`.
