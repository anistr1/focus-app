# Story 1.1: Bootstrap the Desktop App Shell

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a new user,
I want the app to launch into a stable offline desktop shell,
so that I can use the product without setup friction.

## Acceptance Criteria

1. The project is scaffolded as a Tauri desktop app with a React and TypeScript frontend, local-only operation, and no network requirement at startup.
2. The base shell exposes the dark-mode-first design tokens, global layout primitives, and a minimal application surface aligned with the architecture and UX guidance.
3. The initial project structure supports the planned feature areas: timer, breathing, analytics, sessions, tray, settings, shared components, stores, hooks, services, database, animations, lib, and styles.
4. The shell is positioned to meet the MVP performance envelope: lightweight startup, low idle overhead, and no unnecessary background services.

## Tasks / Subtasks

- [x] Initialize the Tauri + React + TypeScript project shell (AC: 1)
  - [x] Create the desktop app scaffold with `src/` for frontend and `src-tauri/` for Rust/Tauri code.
  - [x] Keep the boot path offline-only and avoid adding network-bound startup dependencies.
- [x] Establish the base frontend structure and design system entry points (AC: 2, 3)
  - [x] Create the top-level app shell and routing/layout entry point.
  - [x] Add theme tokens and foundational styles for the dark-first visual system.
  - [x] Create empty feature module folders matching the architecture plan.
- [x] Prepare local persistence and plugin foundations needed by later stories (AC: 1, 3)
  - [x] Register only the baseline Tauri plugins needed to support local-first shell startup and future story growth.
  - [x] Prepare SQLite integration points without building unrelated tables or flows yet.
- [x] Add baseline quality checks for shell startup (AC: 4)
  - [x] Add a lightweight smoke test or validation path confirming the app shell boots.
  - [x] Confirm the initial shell does not introduce obvious performance or resource regressions.

## Dev Notes

- This repo currently contains BMAD artifacts only. There is no existing app code, `package.json`, or git history, so this story should create the initial product scaffold rather than modify an existing shell.
- Treat this as the foundation story for Epic 1. Only create the structure and wiring needed for later Epic 1 stories; do not prebuild analytics, tray flows, updater logic, or unrelated database tables.
- The architecture explicitly selects Tauri, React, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Framer Motion, SQLite, and Drizzle ORM as the target stack.
- The app must stay offline-first. Do not add analytics SDKs, auth, cloud sync, or remote APIs.
- Keep the initial surface minimal: the architecture calls for onboarding, dashboard, breathing overlay, settings modal, and tray menu as the main surfaces over time. This story only needs the shell and design-system entry points.

### Project Structure Notes

- Target structure from architecture:
  - `src/app/`
  - `src/features/timer/`
  - `src/features/breathing/`
  - `src/features/analytics/`
  - `src/features/sessions/`
  - `src/features/tray/`
  - `src/features/settings/`
  - `src/components/ui/`
  - `src/components/charts/`
  - `src/components/timer/`
  - `src/components/breathing/`
  - `src/components/layout/`
  - `src/stores/`, `src/hooks/`, `src/services/`, `src/database/`, `src/animations/`, `src/lib/`, `src/styles/`
- Also expect standard Tauri project files under `src-tauri/`.
- Because no code exists yet, this story is allowed to create new files and folders broadly, but only for shell/foundation concerns.

### References

- Product stack, motion constraints, offline-first requirements, and Phase 1 roadmap: [epics.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/epics.md)
- Architecture stack, project structure, plugin list, and local-first rules: [focus_app_architecture_document.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md)
- UX design system direction, color tokens, and layout principles: [focus_app_ux_specification.md](C:/Users/Anis/Desktop/Vibe%20coding/Focus%20app/_bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- No prior codebase artifacts
- No git history available
- `node '.\node_modules\typescript\bin\tsc' --noEmit`
- `node '.\node_modules\vitest\vitest.mjs' run`
- `node '.\node_modules\vite\bin\vite.js' build`

### Completion Notes List

- Comprehensive story context created from PRD, architecture, UX spec, epics, and sprint status
- Story intentionally limits scope to shell/bootstrap work required for later Epic 1 stories
- Scaffolded the React/Vite frontend shell, Tailwind-based design token entry point, Vitest smoke test, and the planned feature directory structure
- Added `src-tauri` bootstrap files with baseline plugin registration and SQLite/Tauri integration points for later stories
- Frontend typecheck, smoke test, and production build passed
- Rust toolchain is not installed on this machine, so `src-tauri` files were scaffolded but not compiled locally yet

### File List

- _bmad-output/implementation-artifacts/1-1-bootstrap-the-desktop-app-shell.md
- dist/assets/index-27K21DBk.css
- dist/assets/index-BA-_nuoo.js
- dist/index.html
- index.html
- package.json
- package-lock.json
- postcss.config.js
- src/app/App.test.tsx
- src/app/App.tsx
- src/animations/.gitkeep
- src/components/breathing/.gitkeep
- src/components/charts/.gitkeep
- src/components/layout/AppShell.tsx
- src/components/timer/.gitkeep
- src/components/ui/.gitkeep
- src/database/.gitkeep
- src/features/analytics/.gitkeep
- src/features/breathing/.gitkeep
- src/features/settings/.gitkeep
- src/features/sessions/.gitkeep
- src/features/timer/.gitkeep
- src/features/tray/.gitkeep
- src/hooks/.gitkeep
- src/lib/.gitkeep
- src/main.tsx
- src/services/.gitkeep
- src/stores/.gitkeep
- src/styles/globals.css
- src/test/setup.ts
- src-tauri/build.rs
- src-tauri/Cargo.toml
- src-tauri/src/lib.rs
- src-tauri/src/main.rs
- src-tauri/tauri.conf.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts
