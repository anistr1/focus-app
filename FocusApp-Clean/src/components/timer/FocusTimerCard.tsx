import { useEffect, useRef, useState } from "react";
import { BreathingRitualCard } from "../breathing/BreathingRitualCard";
import {
  applyTrayAction,
  createTimerState,
  pauseTimer,
  resetTimer,
  resumeTimer,
  setMode,
  startTimer,
  stopTimer,
  tickTimer,
  type TimerState
} from "../../features/timer/timer-domain";
import {
  clearCheckpoint,
  createSessionCheckpoint,
  readCheckpoint,
  writeCheckpoint
} from "../../features/timer/timer-recovery";
import { createSessionRecord, recordCompletedSession } from "../../features/sessions/session-history";
import { readSettings, SETTINGS_UPDATED_EVENT } from "../../features/settings/settings-state";
import { TIMER_STATUS_EVENT } from "../../features/timer/timer-events";
import {
  buildStreakMilestoneMessage,
  messageForEvent,
  sendFocusNotification,
  shouldNotifyStreakMilestone,
  WINDOWS_NOTIFICATION_GUIDANCE
} from "../../features/notifications/notification-service";
import { readSessionHistory } from "../../features/sessions/session-history";

function formatClock(totalMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function FocusTimerCard() {
  const TRAY_MINI_RITUAL_DURATION_MS = 15_000;
  const initialSettings = readSettings();
  const [timer, setTimer] = useState<TimerState>(() =>
    createTimerState(
      initialSettings.focusDurationMinutes * 60 * 1000,
      initialSettings.breakDurationMinutes * 60 * 1000
    )
  );
  const [ritualEnabled, setRitualEnabled] = useState(initialSettings.breathingEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialSettings.notificationsEnabled);
  const [ritualDurationMs, setRitualDurationMs] = useState(initialSettings.breathingDurationSeconds * 1000);
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [ritualMode, setRitualMode] = useState<"full" | "tray">("full");
  const [pendingRecovery, setPendingRecovery] = useState(() => readCheckpoint(Date.now()));
  const [activeCompletionKey, setActiveCompletionKey] = useState<string | null>(null);
  const [notificationWarning, setNotificationWarning] = useState<string | null>(null);
  const previousStatusRef = useRef(timer.status);
  const inactivityReminderIdRef = useRef<number | null>(null);
  const inactivityReminderSentRef = useRef(false);

  useEffect(() => {
    const onSettings = () => {
      const settings = readSettings();
      setRitualEnabled(settings.breathingEnabled);
      setNotificationsEnabled(settings.notificationsEnabled);
      setRitualDurationMs(settings.breathingDurationSeconds * 1000);
      setTimer((current) => {
        const focusDurationMs = settings.focusDurationMinutes * 60 * 1000;
        const breakDurationMs = settings.breakDurationMinutes * 60 * 1000;
        if (current.status === "running" || current.status === "paused") {
          return { ...current, focusDurationMs, breakDurationMs };
        }
        return createTimerState(focusDurationMs, breakDurationMs);
      });
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, onSettings);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, onSettings);
  }, []);

  useEffect(() => {
    if (timer.status !== "running") {
      return;
    }
    const interval = window.setInterval(() => {
      setTimer((current) => tickTimer(current, Date.now()));
    }, 250);
    return () => window.clearInterval(interval);
  }, [timer.status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f")) {
        return;
      }
      event.preventDefault();
      setTimer((current) => {
        if (current.status === "running") {
          return pauseTimer(current, Date.now());
        }
        if (current.status === "paused") {
          return resumeTimer(current, Date.now());
        }
        if (current.mode === "focus") {
          if (ritualEnabled) {
            setIsRitualActive(true);
            return current;
          }
          setActiveCompletionKey(`focus-${Date.now()}`);
          return startTimer(current, Date.now(), "focus");
        }
        setActiveCompletionKey(`break-${Date.now()}`);
        return startTimer(current, Date.now(), current.mode);
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ritualEnabled]);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    async function bindTrayEvents() {
      try {
        const eventApi = await import("@tauri-apps/api/event");
        unlisten = await eventApi.listen<{ action: "start" | "pause" | "resume" | "quick-break" | "quit" }>(
          "tray-action",
          (event) => {
            const action = event.payload?.action;
            if (!action) {
              return;
            }
            if (action === "quit") {
              return;
            }
            if (action === "start") {
              launchTrayMiniRitual();
              return;
            }
            setTimer((current) => applyTrayAction(current, action, Date.now()));
          }
        );
      } catch {
        // Browser/test runtime without Tauri event bridge.
      }
    }

    bindTrayEvents();
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (timer.status !== "running" || timer.targetTimeMs === null) {
      return;
    }
    const interval = window.setInterval(() => {
      const nowMs = Date.now();
      const remainingMs = Math.max(0, timer.targetTimeMs ? timer.targetTimeMs - nowMs : timer.remainingMs);
      writeCheckpoint(
        createSessionCheckpoint({
          mode: timer.mode,
          remainingMs,
          checkpointedAtMs: nowMs,
          targetTimeMs: nowMs + remainingMs
        })
      );
    }, 10_000);
    return () => window.clearInterval(interval);
  }, [timer.mode, timer.remainingMs, timer.status, timer.targetTimeMs]);

  useEffect(() => {
    if (timer.status === "completed" || timer.status === "idle" || timer.status === "stopped") {
      clearCheckpoint();
    }
  }, [timer.status]);

  useEffect(() => {
    if (inactivityReminderIdRef.current) {
      window.clearTimeout(inactivityReminderIdRef.current);
      inactivityReminderIdRef.current = null;
    }

    if (timer.status === "paused" && notificationsEnabled && !inactivityReminderSentRef.current) {
      inactivityReminderIdRef.current = window.setTimeout(() => {
        void (async () => {
          const message = messageForEvent("inactivity-reminder");
          const result = await sendFocusNotification(message.title, message.body);
          if (result.blocked) {
            setNotificationWarning(WINDOWS_NOTIFICATION_GUIDANCE);
          }
          inactivityReminderSentRef.current = true;
        })();
      }, 120_000);
      return;
    }

    if (timer.status !== "paused") {
      inactivityReminderSentRef.current = false;
    }

    return () => {
      if (inactivityReminderIdRef.current) {
        window.clearTimeout(inactivityReminderIdRef.current);
        inactivityReminderIdRef.current = null;
      }
    };
  }, [notificationsEnabled, timer.status]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(TIMER_STATUS_EVENT, { detail: timer.status }));
  }, [timer.status]);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    if (previousStatus !== "completed" && timer.status === "completed" && activeCompletionKey) {
      const durationMs = timer.mode === "focus" ? timer.focusDurationMs : timer.breakDurationMs;
      recordCompletedSession(
        createSessionRecord({
          durationMs,
          completedAtMs: Date.now(),
          completionKey: activeCompletionKey
        })
      );
      setActiveCompletionKey(null);

      if (notificationsEnabled) {
        const completionEvent = timer.mode === "focus" ? "focus-complete" : "break-complete";
        const completionMessage = messageForEvent(completionEvent);
        void (async () => {
          const completionResult = await sendFocusNotification(
            completionMessage.title,
            completionMessage.body
          );
          if (completionResult.blocked) {
            setNotificationWarning(WINDOWS_NOTIFICATION_GUIDANCE);
          }

          if (timer.mode === "focus") {
            const completedSessions = readSessionHistory().length;
            if (shouldNotifyStreakMilestone(completedSessions)) {
              const streakMessage = buildStreakMilestoneMessage(completedSessions);
              const milestoneResult = await sendFocusNotification("Streak milestone", streakMessage);
              if (milestoneResult.blocked) {
                setNotificationWarning(WINDOWS_NOTIFICATION_GUIDANCE);
              }
            }
          }
        })();
      }
    }
    previousStatusRef.current = timer.status;
  }, [activeCompletionKey, notificationsEnabled, timer]);

  const showPause = timer.status === "running";
  const showResume = timer.status === "paused";
  const showStart = timer.status === "idle" || timer.status === "stopped" || timer.status === "completed";

  function launchTrayMiniRitual() {
    setRitualMode("tray");
    setIsRitualActive(true);
  }

  function startFocusSession() {
    if (ritualEnabled) {
      setRitualMode("full");
      setIsRitualActive(true);
      return;
    }
    setActiveCompletionKey(`focus-${Date.now()}`);
    setTimer((current) => startTimer(current, Date.now(), "focus"));
  }

  function completeRitualAndStart() {
    setIsRitualActive(false);
    setRitualMode("full");
    setActiveCompletionKey(`focus-${Date.now()}`);
    setTimer((current) => startTimer(current, Date.now(), "focus"));
  }

  function resumeFromCheckpoint() {
    if (!pendingRecovery) {
      return;
    }
    setPendingRecovery(null);
    setTimer((current) => ({
      ...current,
      mode: pendingRecovery.mode,
      status: "running",
      remainingMs: pendingRecovery.remainingMs,
      targetTimeMs: Date.now() + pendingRecovery.remainingMs,
      lastError: null
    }));
  }

  function dismissRecovery() {
    clearCheckpoint();
    setPendingRecovery(null);
  }

  if (isRitualActive) {
    const trayMode = ritualMode === "tray";
    return (
      <BreathingRitualCard
        durationMs={trayMode ? TRAY_MINI_RITUAL_DURATION_MS : ritualDurationMs}
        compact={trayMode}
        forceReducedMotion={trayMode}
        onComplete={completeRitualAndStart}
        onSkip={completeRitualAndStart}
      />
    );
  }

  return (
    <article className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Focus Timer</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">{formatClock(timer.remainingMs)}</h2>
      <p
        className="mt-2 text-sm text-[var(--text-secondary)]"
        aria-live="polite"
        aria-label="Focus timer status"
      >
        {timer.mode === "focus" ? "Focus mode" : "Break mode"} • {timer.status}
      </p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Shortcut: Ctrl+Shift+F toggles Start/Pause Focus
      </p>

      {pendingRecovery ? (
        <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          <p>Your last session was interrupted. Resume from latest checkpoint?</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={resumeFromCheckpoint}
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs"
            >
              Resume Session
            </button>
            <button
              type="button"
              onClick={dismissRecovery}
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {timer.lastError ? (
        <p className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          {timer.lastError}
        </p>
      ) : null}
      {notificationWarning ? (
        <p className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          {notificationWarning}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {showStart ? (
          <button
            type="button"
            onClick={() => {
              if (timer.mode === "focus") {
                startFocusSession();
                return;
              }
              setActiveCompletionKey(`break-${Date.now()}`);
              setTimer((current) => startTimer(current, Date.now(), "break"));
            }}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--bg-base)]"
          >
            {timer.mode === "focus" ? "Start Focus" : "Start Break"}
          </button>
        ) : null}

        {showPause ? (
          <button
            type="button"
            onClick={() => setTimer((current) => pauseTimer(current, Date.now()))}
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm"
          >
            Pause
          </button>
        ) : null}

        {showResume ? (
          <button
            type="button"
            onClick={() => setTimer((current) => resumeTimer(current, Date.now()))}
            className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm"
          >
            Resume
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setActiveCompletionKey(null);
            setTimer((current) => stopTimer(current));
          }}
          className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveCompletionKey(null);
            setTimer((current) => resetTimer(current));
          }}
          className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTimer((current) => setMode(current, "focus"))}
          className="rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs"
        >
          Focus Mode
        </button>
        <button
          type="button"
          onClick={() => setTimer((current) => setMode(current, "break"))}
          className="rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs"
        >
          Break Mode
        </button>
      </div>
      <p className="mt-4 text-xs text-[var(--text-secondary)]">
        Breathing and duration preferences are managed from Settings.
      </p>
    </article>
  );
}
