---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/windows_focus_app_prd.md
  - _bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_architecture_document.md
  - _bmad-output/planning-artifacts/prds/prd-windows-focus-app-2026-05-24/focus_app_ux_specification.md
---

# Focus app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Focus app, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The system must provide a focus timer that supports start, pause, stop, reset, break mode, and custom durations.
FR2: The timer engine must use timestamp-based calculations and remain accurate through minimize, backgrounding, sleep, hibernation, and overnight use.
FR3: The system must provide an optional pre-focus breathing ritual before a focus session, including presets for 30 seconds, 1 minute, and 2 minutes with inhale, hold, and exhale phases.
FR4: The system must provide a condensed 15-second mini breathing ritual for tray-started sessions, with an immediate skip action.
FR5: The system must persist session history including total focus time, daily sessions, completed sessions, and average session length.
FR6: The system must provide a calm analytics dashboard showing daily focus time, weekly trends, streaks, monthly totals, and session completion history.
FR7: The system must provide a tray app with quick start, pause, resume, quick break, and quit actions, and support running focus sessions without opening the main window.
FR8: The system must issue native Windows notifications for session completion, break completion, streak milestones, inactivity reminders, and update availability without interrupting active focus sessions.
FR9: The system must provide user settings for timer durations, dark mode, sounds, startup behavior, notifications, breathing ritual settings, animation intensity, telemetry opt-in or opt-out, and anonymized stats export.
FR10: The system must provide accessibility-first controls including global shortcuts, full keyboard navigation, high-contrast support, visible focus indicators, reduced-motion behavior, and screen reader support for timer state and notifications.
FR11: The system must provide a first-run onboarding flow with welcome, default duration selection, telemetry choice, breathing demo, and timer-ready steps, and persist completion so onboarding never repeats.
FR12: The system must persist app state locally, including onboarding completion, default duration, telemetry preference, active session checkpoints, session data, analytics data, and breathing preferences.
FR13: The system must support optional launch on Windows startup.
FR14: The system must persist and restore window size, position, and last state.
FR15: The system must support silent background updates via Tauri Updater using GitHub Releases, with non-modal surfacing on the dashboard only.
FR16: The system must remain fully local-first and offline-first, with anonymous telemetry stored locally and no automatic network transmission in MVP.
FR17: The system must allow optional export of anonymized usage metrics as JSON from Settings.
FR18: The system must recover interrupted sessions after crashes by restoring from the most recent saved checkpoint.

### NonFunctional Requirements

NFR1: App startup time must be under 1 second at P95.
NFR2: Idle RAM usage must remain below 150MB.
NFR3: Idle CPU usage must remain near zero with no unnecessary background services.
NFR4: Animations and interactions must render at 60fps.
NFR5: Installer size should remain under 30MB.
NFR6: The application must feel native on Windows 10 and 11, including tray behavior, window behavior, notifications, startup integration, and DPI scaling.
NFR7: The product must maintain a minimal, calming, premium UX with low visual noise and one accent color.
NFR8: The application must work fully offline with no cloud sync, accounts, remote APIs, or third-party analytics SDKs in MVP.
NFR9: All text and background pairings must meet WCAG AA contrast requirements.
NFR10: All spacing and type must scale with rem-based responsive layouts across 1080p, 1440p, ultrawide, and 4K displays.
NFR11: All animations must respect prefers-reduced-motion and degrade to lower-motion alternatives.
NFR12: Notifications and completion states must remain non-intrusive and non-jarring.
NFR13: The app must avoid heavy, dashboard-like, gamified, corporate, or cluttered interactions.
NFR14: The implementation must avoid reliance on setInterval-only timing and must tolerate system sleep and backgrounding.
NFR15: Session state persistence for crash recovery must avoid excessive disk I/O by checkpointing at a bounded interval.

### Additional Requirements

- Use Tauri as the desktop framework with a React, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Framer Motion, SQLite, and Drizzle ORM stack.
- Register and integrate the required Tauri plugins: notification, autostart, sql, tray, window-state, process, store, global-shortcut, and updater.
- Structure the codebase around feature modules for timer, breathing, analytics, sessions, tray, and settings, plus shared UI, stores, hooks, services, database, animations, lib, and styles.
- Implement a tray-first UX that supports quick controls and background operation with instant responsiveness and low resource usage.
- Implement timestamp-based timer logic in the core session engine and explicitly avoid drift-prone interval-only logic.
- Persist onboarding state in SQLite via an app_state model that includes onboarding_completed, default_duration, and telemetry_opt_in.
- Persist active session recovery state to SQLite every 10 seconds to support crash recovery with bounded write frequency.
- Use local-only telemetry aggregation stored in SQLite and implement JSON export without automatic transmission.
- Use GitHub Releases as the MVP update host for the updater integration.
- Prevent update prompts from interrupting active focus sessions and surface update availability as a subtle dashboard banner.
- Implement window state persistence for size, position, and last state.
- Support optional autostart on Windows login.
- Support native Windows toast notifications for timer and streak events.
- Implement deep links or OS guidance for notification settings when notifications are blocked.
- Cap runaway sessions by auto-pausing if a session exceeds 4 hours and surface a calm recovery message.
- Handle SQLite write failures with silent retry once, then a single dismissible warning without blocking the timer.
- Maintain a single-window, minimal-surface architecture with onboarding, dashboard, breathing overlay, settings modal, and tray menu as the main surfaces.

### UX Design Requirements

UX-DR1: Implement the "Pause -> Breathe -> Focus" core interaction flow as the primary product experience, ensuring all primary entry points support the ritualized transition into focus.
UX-DR2: Implement a dark-mode-first "Calm Premium Minimalism" design system using the defined color tokens, near-black surfaces, one accent color, soft gradients, minimal borders, and spacious layouts.
UX-DR3: Implement typography and spacing hierarchy that keeps the timer as the visual and emotional center while preserving low cognitive load across dashboard, session, onboarding, analytics, and settings surfaces.
UX-DR4: Implement the defined motion system with concrete durations and easing values for page transitions, button presses, modal open, timer tick, chart draw, and success states.
UX-DR5: Implement the breathing circle animation with cadence-driven expansion and contraction, soft gradients, centered minimal layout, and reduced-intensity behavior for onboarding preview.
UX-DR6: Implement reduced-motion behavior across the app by replacing scale and translate animations with opacity-based fallbacks and disabling chart draw animations when prefers-reduced-motion is enabled.
UX-DR7: Implement the first-run onboarding as a five-step full-screen centered card flow with skippable steps except telemetry choice, back navigation where specified, and a final shortcut tip on the timer-ready step.
UX-DR8: Implement the returning-user dashboard flow so the user can reach the timer in one tap from launch, with current streak, today's focus time, quick start, recent sessions, and session presets.
UX-DR9: Implement the tray-start flow with a compact mini ritual overlay above the tray icon and a silent background session start that does not open the main app window.
UX-DR10: Implement the focus session screen as an immersive, distraction-free, centered layout with stable timer readability and minimal visible controls.
UX-DR11: Implement the analytics view with calm chart animations, weekly chart, streak, monthly total, and low-clutter presentation that supports reflection without pressure.
UX-DR12: Implement the settings surface as a modal-based, low-density control center covering timer, startup, notifications, sounds, breathing, animation intensity, telemetry, stats export, and shortcuts discoverability.
UX-DR13: Implement visible 2px accent focus rings with 2px offset on all interactive elements and ensure full keyboard navigation with Tab, Shift+Tab, Enter, Space, and Escape across all surfaces.
UX-DR14: Implement global shortcut discoverability in onboarding, tray tooltip, and a dedicated shortcuts settings tab, including Start/Pause, Stop Session, and Open App actions.
UX-DR15: Implement screen reader support using appropriate labels and aria-live behavior so timer remaining time is announced politely at defined intervals.
UX-DR16: Implement WCAG AA contrast-compliant UI states across all text, timer displays, controls, gradients, and high-contrast scenarios.
UX-DR17: Implement responsive scaling behavior that keeps content centered and calm across 1080p, 1440p, ultrawide, and 4K displays.
UX-DR18: Implement calm, supportive error and edge-case UX for crash recovery, blocked notifications, long-running sessions, system sleep resume, SQLite save failure, and first-run notifications-off cases.
UX-DR19: Implement subtle feedback patterns for session start, session completion, analytics updates, and notifications without aggressive gamification or productivity guilt.
UX-DR20: Implement the reusable core components identified by the UX spec: FocusTimer, BreathingCircle, SessionControls, AnalyticsCard, TrayMenu, NotificationToast, SessionHistory, StreakDisplay, AmbientBackground, and SettingsModal.

### FR Coverage Map

FR1: Epic 1 - Core focus timer controls
FR2: Epic 1 - Reliable timestamp-based timer engine
FR3: Epic 1 - Full pre-focus breathing ritual
FR4: Epic 3 - Tray-start mini ritual
FR5: Epic 2 - Session history persistence
FR6: Epic 2 - Analytics dashboard and reflection
FR7: Epic 3 - Tray app quick controls
FR8: Epic 3 - Native notifications and non-intrusive alerts
FR9: Epic 2 - Settings and user preferences
FR10: Epic 1 - Accessibility baseline and core shortcuts
FR11: Epic 1 - First-run onboarding flow
FR12: Epic 1 - Local app state and recovery persistence
FR13: Epic 3 - Windows startup launch
FR14: Epic 3 - Window state persistence
FR15: Epic 4 - Silent updater and release-safe update UX
FR16: Epic 1 - Offline-first and local-only telemetry foundation
FR17: Epic 2 - Anonymized JSON stats export
FR18: Epic 1 - Crash recovery from saved checkpoints

## Epic List

### Epic 1: First-Run Ritual and Focus Foundation
Users can install the app, complete onboarding, configure their first session defaults, and run a reliable, calming focus session with the core breathing ritual and accessibility baseline in place.
**FRs covered:** FR1, FR2, FR3, FR10, FR11, FR12, FR16, FR18

### Epic 2: Daily Focus Workflow and Progress Reflection
Users can build a repeatable focus habit by reviewing session history, seeing calm analytics, using local telemetry summaries, and adjusting core preferences without leaving the product's minimal workflow.
**FRs covered:** FR5, FR6, FR9, FR17

### Epic 3: Desktop Companion and Background Control
Users can use the app as a true Windows companion through tray-based control, mini ritual start, native notifications, startup behavior, and window persistence while keeping sessions lightweight and unobtrusive.
**FRs covered:** FR4, FR7, FR8, FR13, FR14

### Epic 4: Product Polish, Update Safety, and MVP Readiness
Users get a polished, stable, production-ready desktop experience with updater support, calm recovery behaviors, performance tuning, accessibility completion, and final UX consistency across supported displays.
**FRs covered:** FR15, plus cross-cutting completion for all prior FRs

## Epic 1: First-Run Ritual and Focus Foundation

Users can install the app, complete onboarding, configure their first session defaults, and run a reliable, calming focus session with the core breathing ritual and accessibility baseline in place.

### Story 1.1: Bootstrap the Desktop App Shell

As a new user,
I want the app to launch into a stable offline desktop shell,
So that I can use the product without setup friction.

**Acceptance Criteria:**

**Given** the app is installed and launched for the first time
**When** startup completes
**Then** the app opens in under 1 second on the target environment
**And** the Tauri, React, TypeScript, local storage, and SQLite foundations are initialized without requiring network access

**Given** the app is running
**When** the base shell renders
**Then** the dark-mode-first design tokens and core layout primitives are available
**And** the app remains within the MVP offline-first architecture constraints

**Given** the app is idle
**When** no session is active
**Then** it avoids unnecessary background work
**And** the implementation is positioned to meet idle CPU and RAM targets

### Story 1.2: Complete First-Run Onboarding

As a first-time user,
I want a guided onboarding flow,
So that I can configure the app and reach my first focus session quickly.

**Acceptance Criteria:**

**Given** I open the app for the first time
**When** onboarding starts
**Then** I see the five required steps: welcome, default duration, telemetry choice, breathing demo, and timer ready
**And** the flow matches the approved UX sequence

**Given** I move through onboarding
**When** I make selections or skip eligible steps
**Then** my choices are persisted locally
**And** onboarding does not repeat after completion

**Given** I reach the timer-ready step
**When** onboarding finishes
**Then** I land in the main focus experience
**And** I see the global shortcut tip defined in the UX spec

### Story 1.3: Run a Reliable Focus Timer

As a focus user,
I want to start, pause, stop, reset, and complete focus sessions reliably,
So that I can trust the timer during real work.

**Acceptance Criteria:**

**Given** I configure a focus duration
**When** I start a session
**Then** the timer begins accurately using timestamp-based calculations
**And** it supports pause, resume, stop, reset, and break-mode entry points

**Given** the app is minimized, backgrounded, or the system sleeps
**When** I return to the app
**Then** the timer reflects correct remaining time
**And** no drift-prone interval-only logic determines session state

**Given** a session runs unusually long or the app state becomes inconsistent
**When** a protective edge case is triggered
**Then** the timer fails calmly
**And** the UX follows the non-disruptive recovery guidance from the UX spec

### Story 1.4: Add the Full Breathing Ritual Experience

As a user preparing to focus,
I want an optional guided breathing ritual before my session,
So that I can transition into deep work intentionally.

**Acceptance Criteria:**

**Given** breathing ritual is enabled
**When** I start a focus session
**Then** I am shown the breathing ritual before the timer begins
**And** I can use the configured preset duration and skip behavior

**Given** the ritual is active
**When** inhale, hold, and exhale phases run
**Then** the breathing circle animation follows the approved cadence and motion bounds
**And** the interface stays minimal and distraction-free

**Given** reduced motion is enabled
**When** the ritual runs
**Then** the animation switches to the reduced-motion version
**And** accessibility behavior remains intact

### Story 1.5: Persist Local State and Recover Interrupted Sessions

As a returning user,
I want my app state and interrupted sessions to recover locally,
So that I do not lose progress after crashes or restarts.

**Acceptance Criteria:**

**Given** I complete onboarding or change default focus preferences
**When** the app saves state
**Then** onboarding completion, duration choice, telemetry preference, and related app state are persisted locally
**And** the app remains offline-first

**Given** a focus session is active
**When** checkpoints are saved
**Then** active session recovery data is persisted at a bounded interval
**And** the write strategy avoids excessive disk I/O

**Given** the app crashes or closes unexpectedly during a session
**When** I reopen it
**Then** I am offered calm recovery from the most recent saved checkpoint
**And** the recovery UX matches the product tone

### Story 1.6: Deliver Accessibility Baseline for Core Flows

As a keyboard or assistive-technology user,
I want the core onboarding, ritual, and timer flows to be accessible,
So that I can use the app reliably without friction.

**Acceptance Criteria:**

**Given** I navigate the app with a keyboard
**When** I move through onboarding, breathing, and timer controls
**Then** all interactive elements are reachable and operable with standard keys
**And** visible focus indicators are present

**Given** I use the global start or pause shortcut
**When** the shortcut is triggered
**Then** the core timer action executes reliably
**And** the shortcut is discoverable in the required UX locations

**Given** I use reduced motion, high contrast, or a screen reader
**When** I interact with Epic 1 flows
**Then** the app provides the specified accessible alternatives
**And** timer state and key changes are announced appropriately

## Epic 2: Daily Focus Workflow and Progress Reflection

Users can build a repeatable focus habit by reviewing session history, seeing calm analytics, using local telemetry summaries, and adjusting core preferences without leaving the product's minimal workflow.

### Story 2.1: Record Completed Sessions and Show Session History

As a returning user,
I want my completed focus sessions stored and visible,
So that I can review my recent work and build a sense of consistency.

**Acceptance Criteria:**

**Given** I complete a focus session
**When** the session ends successfully
**Then** the app stores the session locally with duration, completion state, and timestamp
**And** the data is available offline

**Given** I open the dashboard or history area
**When** session history loads
**Then** I can view recent sessions, total focus time, completed sessions, and average session length
**And** the presentation remains minimal and readable

**Given** there is no session history yet
**When** I view the history state
**Then** I see a calm empty state
**And** the UI avoids guilt-inducing or noisy messaging

### Story 2.2: Surface Calm Analytics and Streak Insights

As a habit-building user,
I want clear analytics and streak insights,
So that I can reflect on my progress without feeling pressured.

**Acceptance Criteria:**

**Given** session data exists
**When** I open the analytics view
**Then** I see daily focus time, weekly trends, streaks, monthly totals, and completion history
**And** the charts and summaries follow the approved calm visual style

**Given** reduced motion is enabled
**When** analytics render
**Then** chart animations are disabled or simplified
**And** the information remains fully understandable

**Given** analytics are displayed
**When** values update after new sessions
**Then** the calculations remain accurate
**And** the UX emphasizes reflection rather than competition or gamification

### Story 2.3: Manage Core Preferences in Settings

As a user with personal focus preferences,
I want to adjust key app settings,
So that the app fits my workflow without friction.

**Acceptance Criteria:**

**Given** I open Settings
**When** the settings modal loads
**Then** I can manage timer durations, sounds, notifications, breathing preferences, animation intensity, telemetry preference, and startup-related preferences intended for the product
**And** the layout stays low-density and easy to navigate

**Given** I change a supported preference
**When** I save or dismiss the settings flow
**Then** the preference persists locally
**And** the updated behavior is applied in the appropriate app surface

**Given** I use keyboard navigation or assistive technology
**When** I interact with Settings
**Then** all controls remain accessible
**And** the focus, contrast, and labeling patterns remain consistent with Epic 1 accessibility rules

### Story 2.4: Export Local Telemetry Summary as JSON

As a privacy-conscious user,
I want to export my anonymized local usage summary,
So that I can review or share metrics without cloud syncing.

**Acceptance Criteria:**

**Given** telemetry is stored locally
**When** I choose export from Settings
**Then** the app generates an anonymized JSON file containing the approved local metrics only
**And** no automatic transmission occurs

**Given** telemetry export is triggered
**When** the file is produced
**Then** the export excludes personal content, window titles, keystrokes, and active application data
**And** the export remains aligned with the MVP privacy constraints

**Given** export succeeds or fails
**When** feedback is shown
**Then** the message is calm and non-technical
**And** the app never blocks the main focus workflow

## Epic 3: Desktop Companion and Background Control

Users can use the app as a true Windows companion through tray-based control, mini ritual start, native notifications, startup behavior, and window persistence while keeping sessions lightweight and unobtrusive.

### Story 3.1: Control Focus Sessions from the System Tray

As a desktop utility user,
I want to control focus sessions from the system tray,
So that I can start and manage focus without opening the full app.

**Acceptance Criteria:**

**Given** the app is running
**When** I open the tray menu
**Then** I can access quick actions for start, pause, resume, quick break, and quit
**And** those actions respond instantly

**Given** I start or manage a session from the tray
**When** the command executes
**Then** the timer state stays consistent with the main app state
**And** the app remains lightweight in the background

**Given** the tray menu is unavailable or errors
**When** recovery is needed
**Then** the app fails gracefully
**And** it does not corrupt the active session state

### Story 3.2: Launch a Mini Ritual and Silent Background Focus Session

As a user working from my desktop flow,
I want a compact tray-start ritual and silent focus launch,
So that I can enter focus mode without disrupting my workspace.

**Acceptance Criteria:**

**Given** I choose "Start Focus" from the tray
**When** tray-start begins
**Then** I see the compact 15-second mini ritual with the defined cadence and immediate skip action
**And** it appears without opening the full main window

**Given** the mini ritual completes or is skipped
**When** the focus session starts
**Then** the session runs in the background
**And** the main app window remains closed unless explicitly opened

**Given** reduced motion or accessibility needs are active
**When** the mini ritual runs
**Then** it uses the appropriate accessible fallback behavior
**And** the interaction remains calm and unobtrusive

### Story 3.3: Deliver Native Notifications for Focus Events

As a user relying on ambient reminders,
I want native Windows notifications for important focus events,
So that I stay informed without having to watch the timer constantly.

**Acceptance Criteria:**

**Given** a session completes, a break completes, a streak milestone occurs, or inactivity logic is triggered
**When** the relevant event fires
**Then** the app shows the correct native Windows notification
**And** the message stays non-intrusive

**Given** notifications are blocked in Windows
**When** the app detects the limitation
**Then** it shows calm guidance inside the app
**And** provides the intended route to notification settings

**Given** I am in an active focus session
**When** other app events occur
**Then** notifications and related feedback do not interrupt the focus experience with disruptive modals

### Story 3.4: Persist Window State and Startup Behavior

As a frequent user,
I want the app to remember how I use it on Windows,
So that reopening the app feels instant and native.

**Acceptance Criteria:**

**Given** I move, resize, minimize, or restore the app window
**When** I close and reopen the app
**Then** the window restores its saved size, position, and last state
**And** the behavior feels stable across sessions

**Given** I enable or disable launch on Windows startup
**When** the preference is saved
**Then** the app updates autostart behavior correctly
**And** the setting persists locally

**Given** startup launch is enabled
**When** Windows starts and the app auto-launches
**Then** the app opens in the intended lightweight state
**And** it does not disrupt the desktop or require immediate interaction

## Epic 4: Product Polish, Update Safety, and MVP Readiness

Users get a polished, stable, production-ready desktop experience with updater support, calm recovery behaviors, performance tuning, accessibility completion, and final UX consistency across supported displays.

### Story 4.1: Deliver Silent Background Updates Safely

As a user,
I want the app to update quietly in the background,
So that I stay current without interruptions during focus sessions.

**Acceptance Criteria:**

**Given** an update is available from the configured release source
**When** the updater checks in the background
**Then** the app downloads and prepares the update silently
**And** no disruptive modal appears during an active focus session

**Given** an update is ready
**When** I am on the dashboard
**Then** I see a subtle non-modal update indication
**And** the prompt matches the calm product tone

**Given** an update fails
**When** fallback behavior is needed
**Then** the current version continues running safely
**And** failure messaging remains minimal and non-blocking

### Story 4.2: Complete Accessibility and Reduced-Motion Hardening

As an accessibility-sensitive user,
I want all major app surfaces to respect motion, contrast, and assistive needs,
So that the polished product remains comfortable and usable every day.

**Acceptance Criteria:**

**Given** I use reduced motion
**When** I navigate onboarding, timer, ritual, analytics, tray-start, and settings-related flows
**Then** each surface applies its approved reduced-motion fallback
**And** no critical information depends on animation

**Given** I use high contrast, keyboard navigation, or a screen reader
**When** I move across all shipped MVP surfaces
**Then** focus, contrast, semantics, and announcements remain consistent
**And** no Epic 2 or Epic 3 surface regresses below the Epic 1 accessibility baseline

**Given** accessibility issues are discovered during final audit
**When** fixes are applied
**Then** they are completed before MVP signoff
**And** they preserve the calm visual language

### Story 4.3: Polish Performance, Responsiveness, and Recovery UX

As a daily user,
I want the full app to feel fast, stable, and calm across real Windows environments,
So that the final product feels trustworthy and premium.

**Acceptance Criteria:**

**Given** the app is tested on supported display classes
**When** it runs across 1080p, 1440p, ultrawide, and 4K environments
**Then** layouts remain centered, readable, and visually calm
**And** no major scaling regressions remain

**Given** core user flows are exercised end to end
**When** performance is measured
**Then** startup, idle behavior, animation smoothness, and resource usage remain within MVP targets
**And** regressions are addressed before release

**Given** recovery and edge-case states occur
**When** the user encounters interrupted sessions, blocked notifications, long sessions, save issues, or similar conditions
**Then** the UX messaging stays calm and supportive
**And** the app remains functional without breaking the main workflow
