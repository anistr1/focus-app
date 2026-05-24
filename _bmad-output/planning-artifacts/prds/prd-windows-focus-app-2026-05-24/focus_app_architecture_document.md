# Architecture Decision Document

_This document defines the technical architecture, UX structure, implementation boundaries, and system decisions for the Windows Focus App project._

---

# Project Context Analysis

## Requirements Overview

### Functional Requirements

- FR-01: Focus Timer — start, pause, stop, reset, break mode, custom durations
- FR-02: Session History — total focus time, daily sessions, averages
- FR-03: Analytics Dashboard — daily/weekly trends, streaks, monthly totals
- FR-04: Tray App — quick start/pause/resume/quit with instant responsiveness
- FR-05: Notifications — native Windows toast for session/break/streak/inactivity
- FR-06: Settings — timer durations, dark mode, sounds, startup, notifications, animations
- FR-07: Accessibility & Keyboard Control — global shortcut, keyboard nav, high-contrast, screen reader
- FR-08: First-Run Experience — guided onboarding (welcome → duration → telemetry opt-in → breathing demo → timer ready)

---

### Non-Functional Requirements

- NFR-1: Startup time under 1 second
- NFR-2: Idle RAM usage below 150MB
- NFR-3: 60fps smooth animations
- NFR-4: Minimal CPU usage while idle
- NFR-5: Fully offline/local-first functionality
- NFR-6: Native-feeling Windows behavior
- NFR-7: Responsive scaling across 1080p, 1440p, ultrawide, and 4K displays
- NFR-8: Fast minimize/restore behavior
- NFR-9: Zero unnecessary background services
- NFR-10: Minimal visual noise and cognitive load

---

## Product Philosophy

The product is not a productivity dashboard.

The product is:
- a focus ritual
- a calm workspace companion
- an emotional transition into deep work

The app should feel:
- lightweight
- intentional
- elegant
- peaceful
- immersive

Avoid:
- feature overload
- corporate UX
- gamification clutter
- task management complexity

---

# Technical Stack Decisions

## Desktop Framework

## Selected: Tauri

### Rationale

- extremely lightweight
- native performance
- low memory usage
- secure architecture
- modern desktop development stack
- ideal for utility-style applications

### Rejected Alternative: Electron

Reason:
- heavier memory usage
- larger bundle size
- unnecessary overhead for current scope

---

## Frontend Stack

- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Rationale

Provides:
- rapid UI development
- scalable component architecture
- premium modern visual quality
- strong TypeScript safety

---

## Animation System

## Selected: Framer Motion

### Usage Principles

Animations must feel:
- subtle
- calm
- smooth
- low-friction

Avoid:
- flashy transitions
- excessive movement
- bounce-heavy interactions

---

## State Management

## Selected: Zustand

### Rationale

- lightweight
- minimal boilerplate
- ideal for desktop utility apps
- fast and scalable

---

## Local Database

## Selected: SQLite

### Responsibilities

Store:
- session history
- analytics
- streaks
- settings
- breathing preferences

### ORM

Selected:
- Drizzle ORM

---

# Core Architectural Decisions

## D1: Local-First Architecture

The app must work entirely offline.

No:
- cloud sync
- remote APIs
- accounts
- authentication

All user data remains local.

Telemetry clarification:
- Anonymous usage metrics (Activation, Retention, Session Completion) are **permitted** but are stored locally in SQLite only.
- No automatic network transmission in MVP.
- Users may optionally export an anonymized JSON report via Settings.
- No third-party analytics SDK (PostHog, Plausible, etc.) is used in MVP.
- This satisfies the PRD's success metrics requirement without violating the offline-first principle.

---

## D2: Tray-First UX

The app should behave like a lightweight background companion.

Tray functionality:
- start session
- pause session
- resume session
- quick break
- quit app

Requirements:
- instant responsiveness
- seamless minimize behavior
- low resource usage

---

## D3: Breathing Ritual Before Sessions

Before starting a focus session, the app optionally guides the user through a breathing ritual.

Purpose:
- mental reset
- reduce distractions
- intentional focus transition
- calm nervous system

---

### Breathing Modes

Default presets:
- 30 seconds
- 1 minute
- 2 minutes

Breathing phases:
- inhale
- hold
- exhale

---

### Visual Behavior

- animated breathing circle
- smooth scale transitions
- soft gradients
- centered minimal layout
- no distracting UI

Animation targets:
- 60fps
- easing-based motion
- synchronized timing

---

## D4: Timestamp-Based Timer Engine

Do NOT rely only on setInterval.

Use timestamp calculations.

Example:

```txt
remainingTime = targetTime - currentTime
```

Prevents timer drift during:
- sleep mode
- minimize
- background operation
- hibernation

---

## D5: Dark Mode First

The application is designed primarily for dark mode.

Visual goals:
- low eye strain
- calm atmosphere
- premium contrast
- focus immersion

---

## D6: Minimal Surface Architecture

Avoid multiple windows.

Main surfaces:
- onboarding screen (first run only)
- main dashboard
- breathing ritual overlay
- settings modal
- tray menu

No complex navigation system.

---

## D7: Accessibility-First Controls

Accessibility must be built into Phase 1, not retrofitted.

Requirements:
- **Global shortcut:** `Ctrl+Shift+F` to start/pause focus, implemented via `tauri-plugin-global-shortcut`.
- **Keyboard navigation:** Full Tab/Enter/Space navigation across all surfaces.
- **High-contrast support:** Breathing circle and timer must meet WCAG AA contrast ratios in dark mode.
- **Screen reader:** Timer state and notifications must expose accessible labels via ARIA roles.

Rationale: The secondary persona (ADHD/Neurodivergent Student) depends on consistent, low-friction control. Keyboard access is table stakes for a desktop utility.

---

# UX Architecture

## User Flow

```txt
Launch App
   ↓
[First Run?] → Onboarding (FR-08)
   │  1. Welcome screen
   │  2. Default duration selection
   │  3. Telemetry opt-in toggle
   │  4. Breathing ritual demo (30s)
   │  5. Timer ready
   ↓
Dashboard
   ↓
Start Focus Session
   ↓
Optional Breathing Ritual
   ↓
Focus Session
   ↓
Session Complete
   ↓
Break Session
   ↓
Analytics Updated
```

---

# Main Application Areas

## 1. Dashboard

Displays:
- current streak
- today focus time
- quick start session
- recent sessions
- session presets

---

## 2. Focus Session Screen

Displays:
- animated timer
- remaining time
- pause button
- stop button
- breathing visual state

Requirements:
- immersive
- distraction-free
- centered layout

---

## 3. Breathing Ritual Screen

Displays:
- breathing animation
- inhale/exhale guidance
- countdown
- ambient visual atmosphere

Should feel:
- meditative
- calming
- intentional

---

## 4. Analytics View

Displays:
- daily focus duration
- weekly trend
- streaks
- session completion history

Requirements:
- simple
- elegant
- low cognitive load

Avoid dashboard clutter.

---

## 5. Settings

Controls:
- timer durations
- startup behavior
- notifications
- sounds
- breathing ritual settings
- animation intensity
- telemetry opt-in/opt-out
- anonymized stats export (JSON)

---

## 6. Onboarding Screen (First Run Only)

A linear 5-step wizard rendered on first launch. State is persisted to SQLite (`onboarding_completed: boolean`) so it never repeats.

Database table: `app_state { onboarding_completed BOOLEAN, default_duration INTEGER, telemetry_opt_in BOOLEAN }`

Steps:
1. Welcome
2. Default duration selection (25 / 45 / 60 min)
3. Telemetry opt-in (explicit toggle, default off)
4. Breathing ritual demo (30s)
5. Timer ready — transitions directly into Dashboard

---

# UI/UX Design Direction

## Design Inspiration

Inspired by:
- Linear
- Arc Browser
- Raycast
- Session
- Notion Calendar

---

## Visual Style

### Layout

- centered
- spacious
- minimal
- distraction-free

### Typography

Recommended fonts:
- Inter
- Geist

### Motion

Motion should:
- guide attention
- feel soft
- reinforce calmness

### Colors

Use:
- near-black backgrounds
- soft grayscale palette
- one accent color only

Avoid bright UI overload.

---

# Performance Architecture

## Performance Targets

### Startup Time
Under 1 second.

### RAM Usage
Under 150MB idle.

### CPU Usage
Near-zero idle usage.

### Animation Performance
60fps smoothness.

### Installer Size
Target:
- under 30MB

---

# Windows-Specific Architecture

## Startup Launch

Optional auto-launch on Windows startup.

---

## Update Strategy

Silent background updates via `tauri-plugin-updater` pointing to GitHub Releases.

Rules:
- Updates are downloaded silently in the background.
- The user is never interrupted during an active Focus Session.
- Update notification is displayed only on the Dashboard, as a subtle non-modal banner.
- Rollback: if an update fails, the app continues running the previous version.

[ASSUMPTION] GitHub Releases is the update hosting target for MVP. A self-hosted server is a post-MVP option.

---

## Native Notifications

Use:
- Windows native toast notifications

Notification types:
- session complete
- break complete
- streak milestone
- reminder notifications

---

## DPI Scaling

Support:
- 1080p
- 1440p
- 4K
- ultrawide monitors

---

## Window State Persistence

Remember:
- size
- position
- last state

---

# Recommended Project Structure

```txt
src/
 ├── app/
 │
 ├── features/
 │    ├── timer/
 │    ├── breathing/
 │    ├── analytics/
 │    ├── sessions/
 │    ├── tray/
 │    └── settings/
 │
 ├── components/
 │    ├── ui/
 │    ├── charts/
 │    ├── timer/
 │    ├── breathing/
 │    └── layout/
 │
 ├── stores/
 ├── hooks/
 ├── services/
 ├── database/
 ├── animations/
 ├── lib/
 └── styles/
```

---

# Recommended Tauri Plugins

## Essential Plugins

- `notification` — native Windows toast notifications
- `autostart` — optional startup on Windows login
- `sql` — SQLite integration via Drizzle ORM
- `tray` — system tray icon and context menu
- `window-state` — persist window size/position
- `process` — app lifecycle management
- `store` — lightweight key-value persistence for settings
- `global-shortcut` — FR-07 global keyboard shortcut (`Ctrl+Shift+F`)
- `updater` — silent background updates via GitHub Releases (no modal during active sessions)

---

# Data Flow

```txt
React UI
   ↓
Zustand Store
   ↓
Tauri Commands
   ↓
Rust Backend
   ↓
SQLite
```

---

# Development Phases

## Phase 1 — Core Foundation

Build:
- Tauri setup + plugin registration (including `global-shortcut`, `updater`)
- React architecture
- Timestamp-based timer engine (D4)
- Base UI + dark mode design system
- FR-07: Global shortcut (`Ctrl+Shift+F`) and full keyboard navigation
- FR-08: First-run onboarding wizard + `app_state` SQLite table

---

## Phase 2 — Session System

Build:
- SQLite integration via Drizzle ORM
- FR-01: Focus sessions + break sessions
- FR-02: Session history persistence
- FR-03: Analytics tracking (streaks, daily totals)
- FR-06: Settings system
- Local telemetry aggregation pipeline with opt-in export

---

## Phase 3 — Desktop Features

Build:
- FR-04: Tray app (quick controls)
- FR-05: Native Windows notifications
- Startup launch (`autostart` plugin)
- Window state persistence
- Update strategy (`updater` plugin, GitHub Releases)
- FR-07: Screen reader compatibility + high-contrast audit

---

## Phase 4 — Polish

Improve:
- Breathing ritual animations (D3) — 60fps, easing, scale 1.0x–1.5x
- Framer Motion transitions (max 300ms, ease-in-out)
- Typography refinement (Inter/Geist)
- DPI scaling audit (1080p, 1440p, 4K, ultrawide)
- Performance optimization (startup P95 < 1s, idle RAM < 150MB)

---

# Non-Goals

The product intentionally excludes:
- cloud sync
- collaboration
- AI assistant
- task management
- project management
- web blocking
- app blocking
- team features
- browser integrations

The app remains intentionally focused.

---

# Future Ideas

Potential future additions:
- ambient sounds
- fullscreen focus mode
- custom breathing patterns
- keyboard shortcuts
- focus music
- productivity heatmaps
- session tagging
- multiple themes

Only if simplicity is preserved.

---

# Architecture Readiness

## Status

READY FOR IMPLEMENTATION

---

## Primary Success Criteria

The application succeeds if it feels:
- instant
- lightweight
- calming
- immersive
- premium
- effortless

The user should WANT to open the app every day.

