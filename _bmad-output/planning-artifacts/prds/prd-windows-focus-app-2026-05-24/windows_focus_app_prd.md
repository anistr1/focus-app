# Windows Focus App — Product Requirements Document

## Product Vision

Create a lightweight, premium Windows desktop focus app that helps users enter deep work states through calm UX, beautiful interactions, and minimal distractions.

The app should feel:
- instant
- peaceful
- native
- elegant
- emotionally calming

The goal is not to build another productivity dashboard.
The goal is to build a focus ritual.

---

# Product Philosophy

## Core Principles

### 1. Lightweight First
The app must feel invisible to system resources.

Requirements:
- Startup under 1 second
- Minimal CPU usage
- Low idle RAM usage
- Small installer size
- Smooth performance on low-end Windows machines

The app should never feel heavy like a browser-based Electron dashboard.

---

### 2. Minimalism Over Features
The product focuses only on deep work.

Avoid:
- task management
- kanban boards
- notes
- collaboration
- AI clutter
- productivity overload

Core experience:
- focus sessions
- break sessions
- calming environment
- progress tracking
- lightweight analytics

---

### 3. Emotionally Calming UX
The interface should reduce mental friction.

Design goals:
- soft motion
- breathing room
- elegant typography
- subtle contrast
- low visual noise
- smooth transitions

The app should feel emotionally rewarding.

---

### 4. Native Windows Feeling
The application should behave like a modern native Windows utility.

Requirements:
- tray integration
- native notifications
- smooth window behavior
- startup launch support
- fast minimize/restore
- responsive scaling

---

# Product Goals

## Primary Goal
Help users enter and maintain deep focus states with minimal effort.

---

## Secondary Goals
- Build a beautiful personal productivity ritual
- Reduce friction before work sessions
- Encourage consistency through subtle analytics
- Create a calm desktop experience

---

# Target Personas

## 1. The Deep Work Practitioner (Primary)
- **Profile:** Software engineers, writers, designers, or researchers who need long uninterrupted blocks of time.
- **Needs:** Zero friction to start, high resistance to distraction, calm environment.
- **Pain Point:** Traditional productivity tools are too noisy and demand too much meta-work (task management).

## 2. The ADHD/Neurodivergent Student (Secondary)
- **Profile:** Students or self-learners who struggle with task initiation and time blindness.
- **Needs:** A clear visual ritual to transition into focus, strict timeboxing, and gentle rather than alarming notifications.
- **Pain Point:** Getting started is the hardest part; jarring alarms cause anxiety.

---

# Target User Experience

The user opens the app and immediately feels:
- calm
- focused
- organized
- mentally clear

The app should never feel:
- stressful
- corporate
- gamified
- overwhelming

Desired emotional response:
"I want to use this every day."

---

# Recommended Technology Stack

## Desktop Framework
Tauri

Why:
- lightweight
- native performance
- low memory usage
- secure
- modern desktop architecture

---

## Frontend
- React
- TypeScript

---

## Styling
- Tailwind CSS
- shadcn/ui

---

## State Management
- Zustand

---

## Animations
- Framer Motion

Animation standards:
- Duration: Maximum 300ms for all transitions
- Easing: Use `ease-in-out` for non-interactive transitions, and a custom spring (`stiffness: 400, damping: 30`) for interactive elements.
- Style: Opacity fades and slight Y-axis translations (max 8px) only.

Avoid flashy motion.

---

## Local Database
SQLite

Purpose:
- session history
- analytics
- streaks
- settings

---

## ORM
Drizzle ORM

---

## Charts
Recharts

Charts should feel:
- minimalist
- soft
- elegant
- readable

---

# Recommended Architecture

## Frontend
React UI Layer

## Backend
Rust-powered Tauri commands

## Data Layer
SQLite local storage

## Structure

```txt
src/
 ├── features/
 │    ├── timer/
 │    ├── analytics/
 │    ├── sessions/
 │    ├── settings/
 │    └── tray/
 │
 ├── components/
 ├── hooks/
 ├── stores/
 ├── services/
 └── lib/
```

---

# Pre-Focus Ritual System

## Guided Breathing Session

Before every focus session, the app should optionally guide the user through a short breathing ritual.

Purpose:
- mentally reset
- reduce distractions
- create intentional focus transitions
- calm the nervous system
- separate work from noise

The breathing ritual becomes part of the product identity.

---

## Breathing Experience

Default duration:
- 30 seconds
- 1 minute
- 2 minutes

Modes:
- inhale
- hold
- exhale

Visual behavior:
- smooth animated breathing circle
- calming gradients
- soft motion
- minimal UI
- no distracting elements

Animation requirements:
- ultra smooth
- 60fps
- synchronized with breathing rhythm
- easing-based motion

Audio:
- optional ambient sound
- optional breathing guidance sounds
- subtle completion chime

---

## UX Goals

The breathing session should meet the following UX criteria:
- UI Elements: Only one element visible (breathing circle) on a solid/gradient background.
- Motion bounds: Circle scale varies from 1.0x to 1.5x, synchronized exactly to the chosen breathing cadence (e.g., 4s inhale, 4s exhale).
- Distraction-free: Hides OS taskbar and all notifications during the ritual (fullscreen optional).

It should help users transition from:
- chaos → focus
- stress → clarity
- distraction → deep work

---

## User Controls

Settings:
- enable/disable breathing ritual
- choose duration
- sound toggle
- skip option
- animation intensity

---

## Future Extensions

Potential additions:
- calming quotes
- ambient visuals
- focus intention prompts
- meditation modes
- custom breathing patterns

---

# MVP Features

## FR-01: Focus Timer

Core functionality:
- start session
- pause session
- stop session
- reset session
- break mode
- custom durations

Requirements:
- accurate timer handling
- resistant to system sleep
- background-safe

---

## FR-02: Session History

Track:
- total focus time
- daily sessions
- completed sessions
- average session length

---

## FR-03: Analytics Dashboard

Analytics should be simple and calming.

Metrics:
- daily focus time
- weekly focus trends
- streaks
- monthly totals

Avoid aggressive gamification.

---

## FR-04: Tray App

Critical feature.

Tray actions:
- quick start
- quick pause
- quick resume
- quit app

Requirements:
- instant responsiveness
- low resource usage
- seamless minimize behavior

---

## FR-05: Notifications

Use native Windows notifications.

Notification types:
- session complete
- break complete
- streak milestone
- inactivity reminder

Requirements:
- non-intrusive
- minimal design
- optional sound

---

## FR-06: Settings

User controls:
- timer durations
- dark mode
- sounds
- startup behavior
- notifications
- animations

---

## FR-07: Accessibility & Keyboard Control

Requirements:
- Global shortcut to start/pause focus (e.g., `Ctrl+Shift+F`)
- Full keyboard navigation within the app (Tab, Enter, Space)
- High contrast support for the breathing circle and timer
- Screen reader compatibility for timer status and notifications

---

## FR-08: First-Run Experience

The first launch must guide the user into the product's core value immediately.

Onboarding flow:
1. **Welcome screen** — One sentence: "Your focus ritual starts here."
2. **Default duration selection** — Choose preferred Focus Session length (25 / 45 / 60 min). Can be changed later in Settings.
3. **Telemetry opt-in** — Single-toggle prompt with plain-language description: "Help improve this app by sharing anonymous usage stats. No personal data is collected." (Default: off.)
4. **Try the breathing ritual** — A prompted 30-second breathing demo before the first session.
5. **Timer ready** — App drops into the main timer view. No further interruption.

Requirements:
- Onboarding completes in under 2 minutes.
- All steps are skippable except the telemetry toggle (must be an explicit choice).
- State is persisted to SQLite so onboarding never repeats.

---

# UI/UX Guidelines

## Design Direction
Inspired by:
- Linear
- Arc Browser
- Raycast
- Session
- Notion Calendar

---

## Visual Style

### Theme
Dark mode first.

### Layout
- spacious
- minimal
- centered
- distraction-free

### Corners
Soft rounded corners.

### Shadows
Very subtle.

### Accent Color
Only one accent color.

### Motion
Smooth and soft.

Avoid:
- bouncing
- flashy transitions
- excessive movement

---

# Typography

Recommended fonts:
- Inter
- Geist

Typography goals:
- clarity
- elegance
- readability
- calmness

---

# Performance Requirements

## Technical Targets

### Startup Time
Under 1 second.

### RAM Usage
Target idle RAM:
- under 150MB

### CPU Usage
Near-zero idle CPU usage.

### Animation Performance
60fps smooth transitions.

### App Size
Target installer size:
- under 30MB

---

# Windows-Specific Requirements

## Tray Integration
Must feel native and reliable.

---

## DPI Scaling
Support:
- 1080p
- 1440p
- 4K
- ultrawide monitors

---

## Window Behavior
Requirements:
- smooth minimize
- remember window position
- restore previous state
- fast open/close

---

## Startup Launch
Optional launch on Windows startup.

---

## Update Strategy
Requirements:
- Silent background updates via Tauri Updater (self-hosted or GitHub Releases).
- No disruptive "Update Now" modals during a Focus Session.

---

## Telemetry & Privacy
Requirements:
- Track core success metrics (Activation, Retention, Session Completion) using anonymous, aggregated telemetry.
- Explicit opt-in/opt-out toggle during first run (see FR-08).
- Zero tracking of window titles, keystrokes, or active applications.

Transport decision:
- **Local aggregation only.** Stats are stored in SQLite and never automatically transmitted.
- Users may optionally export an anonymized JSON report in Settings (future: used to sync across devices or share with developer voluntarily).
- This keeps the app fully offline-first, avoids GDPR and network dependencies, and respects the product's "lightweight" principle.
- [ASSUMPTION] A third-party analytics SDK (PostHog, Plausible, etc.) is explicitly **not used** in MVP.

---

# Timer Logic Requirements

Do NOT rely only on setInterval.

Use timestamp-based calculations.

Example:

```txt
remainingTime = targetTime - currentTime
```

This prevents timer drift during:
- sleep mode
- app minimize
- system pauses

## Open Questions & Trade-offs
- **System Time Changes:** If the user manually changes the OS clock during a session, the timestamp logic will break. 
  - *Trade-off:* Do we query an NTP server (requires network, breaks offline capability) or accept local time jumps? 
  - *Decision:* Rely on local system time (offline first). Acknowledge that users can cheat the timer.
- **Crash Recovery:** If the app crashes mid-session, does it resume automatically on reboot?
  - *Trade-off:* Writing session state to SQLite every 1 second causes high disk I/O.
  - *Decision:* Save active session state to SQLite every 10 seconds. On restart, resume from the last known 10s checkpoint.

---

# Development Roadmap

## Phase 1 — Core Foundation
- Tauri setup
- React architecture
- timer engine
- basic UI
- FR-07: keyboard navigation and global shortcut (Accessibility must not be retrofitted)
- FR-08: first-run onboarding flow

---

## Phase 2 — Session System
- session history
- SQLite integration
- analytics tracking
- settings system
- Telemetry: local aggregation pipeline with opt-in export

---

## Phase 3 — Desktop Features
- tray app
- notifications
- startup launch
- window persistence
- FR-07: screen reader compatibility and high-contrast audit

---

## Phase 4 — Polish
- animations
- typography refinement
- transitions
- UX improvements
- performance optimization

---

# Non-Goals

The app will NOT include:
- browser blocking
- website blocking
- cloud sync
- social features
- task management
- collaboration
- AI assistants
- project management

The product remains intentionally focused.

## Assumptions
- **[ASSUMPTION] Notifications:** Users have native Windows notifications enabled (Focus Assist is not blocking them).
- **[ASSUMPTION] Environment:** Users are on Windows 10/11. No legacy Windows support.
- **[ASSUMPTION] Local Storage:** Users have sufficient local disk space for SQLite (minimal requirement, but assumed available).

---

# Future Ideas

Potential future additions:
- ambient sounds
- focus music
- fullscreen focus mode
- advanced analytics
- session tags
- productivity heatmaps
- custom themes
- focus rituals

These should only be added if they preserve simplicity.

---

# Success Criteria

The app succeeds when the following metrics are met:
- **Activation:** 60% of users who install the app complete at least one focus session.
- **Retention:** 30% Day-7 retention rate for users who complete their first session.
- **Engagement Quality:** The average ratio of paused time to focused time is < 5% (indicating deep, uninterrupted focus).
- **Performance:** App startup time remains strictly under 1.0 seconds at P95.

The experience should feel:
"minimal, calming, and effortless."

---

# Glossary
- **Focus Session:** A fixed block of uninterrupted time dedicated to work (typically 25-50 minutes).
- **Break Mode:** A short recovery interval between Focus Sessions (typically 5-10 minutes).
- **Breathing Ritual:** An optional guided breathing exercise that precedes a Focus Session to help transition into deep work.

