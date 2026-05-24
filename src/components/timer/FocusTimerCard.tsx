import { useEffect, useRef, useState } from "react";
import { BreathingRitualCard } from "../breathing/BreathingRitualCard";
import { CompletionState } from "./CompletionState";
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
  adjustTime,
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
import { readCategories, CATEGORIES_UPDATED_EVENT, Category } from "../../features/categories/categories-state";
import { TIMER_STATUS_EVENT } from "../../features/timer/timer-events";
import {
  buildStreakMilestoneMessage,
  messageForEvent,
  sendFocusNotification,
  shouldNotifyStreakMilestone,
  WINDOWS_NOTIFICATION_GUIDANCE
} from "../../features/notifications/notification-service";
import { readSessionHistory, SESSION_HISTORY_UPDATED_EVENT } from "../../features/sessions/session-history";
import { buildAnalyticsSummary } from "../../features/analytics/analytics-summary";
import { CategorySelector } from "./CategorySelector";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Play, Pause, Square, SkipForward } from "lucide-react";

function formatClock(totalMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

type FocusTimerCardProps = {
  isMiniWidget?: boolean;
  onExpand?: () => void;
};

export function FocusTimerCard({ isMiniWidget = false, onExpand }: FocusTimerCardProps) {
  const TRAY_MINI_RITUAL_DURATION_MS = 15_000;
  const initialSettings = readSettings();
  const [timer, setTimer] = useState<TimerState>(() =>
    createTimerState(
      initialSettings.focusDurationMinutes * 60 * 1000,
      initialSettings.breakDurationMinutes * 60 * 1000
    )
  );
  
  const [categories, setCategories] = useState<Category[]>(() => readCategories());
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || "");
  const [intention, setIntention] = useState("");

  const lastIntentionRef = useRef<string>("");
  const pendingAutoBreakRef = useRef<boolean>(false);

  const [ritualEnabled, setRitualEnabled] = useState(initialSettings.breathingEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialSettings.notificationsEnabled);
  const [autoStartBreak, setAutoStartBreak] = useState(initialSettings.autoStartBreak);
  const [ritualDurationMs, setRitualDurationMs] = useState(initialSettings.breathingDurationSeconds * 1000);
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [ritualMode, setRitualMode] = useState<"full" | "tray">("full");
  const [pendingRecovery, setPendingRecovery] = useState(() => readCheckpoint(Date.now()));
  const [activeCompletionKey, setActiveCompletionKey] = useState<string | null>(null);
  
  const [todayFocusMs, setTodayFocusMs] = useState(() => {
    return buildAnalyticsSummary(readSessionHistory(), "today").periodTotalMs;
  });

  const previousStatusRef = useRef(timer.status);
  const inactivityReminderIdRef = useRef<number | null>(null);
  const inactivityReminderSentRef = useRef(false);

  // Mood state effect
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    
    if (isRitualActive) {
      root.className = "mood-breathing";
    } else if (timer.status === "running") {
      root.className = timer.mode === "focus" ? "mood-running" : "mood-break";
    } else if (timer.status === "completed") {
      root.className = "mood-completed";
    } else {
      root.className = "mood-idle";
    }
  }, [isRitualActive, timer.status, timer.mode]);

  useEffect(() => {
    const onSettings = () => {
      const settings = readSettings();
      setRitualEnabled(settings.breathingEnabled);
      setNotificationsEnabled(settings.notificationsEnabled);
      setAutoStartBreak(settings.autoStartBreak);
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
    const onCategories = () => {
      setCategories(readCategories());
    };
    window.addEventListener(CATEGORIES_UPDATED_EVENT, onCategories);
    return () => window.removeEventListener(CATEGORIES_UPDATED_EVENT, onCategories);
  }, []);

  useEffect(() => {
    const onHistory = () => {
      setTodayFocusMs(buildAnalyticsSummary(readSessionHistory(), "today").periodTotalMs);
    };
    window.addEventListener(SESSION_HISTORY_UPDATED_EVENT, onHistory);
    return () => window.removeEventListener(SESSION_HISTORY_UPDATED_EVENT, onHistory);
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
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        setTimer((current) => stopTimer(current));
        return;
      }

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
            if (action === "quick-break") {
              setActiveCompletionKey(`break-${Date.now()}`);
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
          await sendFocusNotification(message.title, message.body);
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
      
      // Decoupled completion sound
      const soundFile = timer.mode === "focus"
        ? "/audio/focus-complete.mp3"
        : "/audio/break-complete.mp3";
      const sound = new Audio(soundFile);
      sound.volume = 0.6;
      void sound.play().catch(() => {});

      if (timer.mode === "focus") {
        const catColor = categories.find((c) => c.id === categoryId)?.color || "var(--accent)";
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: [catColor, "#ffffff", "var(--accent)"],
          disableForReducedMotion: true
        });

        lastIntentionRef.current = intention;
        recordCompletedSession(
          createSessionRecord({
            durationMs,
            completedAtMs: Date.now(),
            completionKey: activeCompletionKey,
            intention,
            categoryId
          })
        );
      }
      setActiveCompletionKey(null);

      // Auto-start break logic
      if (timer.mode === "focus" && autoStartBreak) {
        pendingAutoBreakRef.current = true;
      }

      if (notificationsEnabled) {
        const completionEvent = timer.mode === "focus" ? "focus-complete" : "break-complete";
        const completionMessage = messageForEvent(completionEvent);
        void (async () => {
          await sendFocusNotification(
            completionMessage.title,
            completionMessage.body
          );

          if (timer.mode === "focus") {
            const completedSessions = readSessionHistory().length;
            if (shouldNotifyStreakMilestone(completedSessions)) {
              const streakMessage = buildStreakMilestoneMessage(completedSessions);
              await sendFocusNotification("Streak milestone", streakMessage);
            }
          }
        })();
      }
    } else if (
      (previousStatus === "running" || previousStatus === "paused") &&
      (timer.status === "stopped" || timer.status === "idle") &&
      activeCompletionKey
    ) {
      // Stopped early - log the partial focus duration if it is at least 10 seconds
      if (timer.mode === "focus") {
        const elapsedMs = timer.focusDurationMs - timer.remainingMs;
        if (elapsedMs >= 10_000) { // 10 seconds threshold
          
          // Soft sound on early stop
          const earlyStopSound = new Audio("/audio/success.mp3");
          earlyStopSound.volume = 0.3;
          void earlyStopSound.play().catch(() => {});

          lastIntentionRef.current = intention;
          recordCompletedSession(
            createSessionRecord({
              durationMs: elapsedMs,
              completedAtMs: Date.now(),
              completionKey: activeCompletionKey,
              intention,
              categoryId,
              completed: false
            })
          );
        }
      }
      setActiveCompletionKey(null);
    }
    previousStatusRef.current = timer.status;
  }, [activeCompletionKey, notificationsEnabled, timer, intention, categoryId, autoStartBreak]);

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

  const [renderRitual, setRenderRitual] = useState(isRitualActive);
  useEffect(() => {
    if (isRitualActive) setRenderRitual(true);
    else {
      const t = setTimeout(() => setRenderRitual(false), 1000);
      return () => clearTimeout(t);
    }
  }, [isRitualActive]);

  const isCompleted = timer.status === "completed";
  const [renderCompletion, setRenderCompletion] = useState(isCompleted);
  useEffect(() => {
    if (isCompleted) setRenderCompletion(true);
    else {
      const t = setTimeout(() => setRenderCompletion(false), 1000);
      return () => clearTimeout(t);
    }
  }, [isCompleted]);

  const showTimer = !isRitualActive && !isCompleted;
  const trayMode = ritualMode === "tray";
  
  // Resolve category color for ring/glow
  const selectedCategory = categories.find(c => c.id === categoryId);
  const catColor = timer.mode === "break" ? "var(--success)" : (selectedCategory?.color || 'var(--accent)');
  const catGlow = timer.mode === "break" ? "var(--success)" : (selectedCategory?.color ? selectedCategory.color : 'var(--accent)');

  // SVG Ring calculations
  const totalDurationMs = timer.mode === "focus" ? timer.focusDurationMs : timer.breakDurationMs;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // Calculate percentage of time elapsed so the ring diminishes
  const pctRemaining = Math.min(1, Math.max(0, timer.remainingMs / totalDurationMs));
  const dashoffset = circumference - pctRemaining * circumference;

  const showPause = timer.status === "running";
  const showResume = timer.status === "paused";
  const showStart = timer.status === "idle" || timer.status === "stopped" || timer.status === "completed";

  if (isMiniWidget) {
    const miniRadius = 100;
    const miniCircumference = 2 * Math.PI * miniRadius;
    const miniDashoffset = miniCircumference - pctRemaining * miniCircumference;

    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[var(--bg-base)] overflow-hidden rounded-xl border border-[var(--border-subtle)]">
        {/* Glow Background */}
        <div 
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[40px]"
          style={{ width: 180, height: 180, background: timer.status === 'running' ? catGlow : 'transparent', transition: 'background 1s ease' }}
        />
        
        {/* Compact Timer Ring */}
        <div className="relative flex items-center justify-center pointer-events-none w-[220px] h-[220px] mb-4">
          <svg width="220" height="220" className="absolute top-0 left-0 -rotate-90">
            <circle cx="110" cy="110" r={miniRadius} fill="transparent" stroke="var(--bg-elevated)" strokeWidth="6" />
            {timer.status !== "idle" && timer.status !== "stopped" && (
              <circle cx="110" cy="110" r={miniRadius} fill="transparent" stroke={catColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={miniCircumference} strokeDashoffset={miniDashoffset} style={{ filter: `drop-shadow(0 0 6px ${catGlow})` }} />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-4xl font-light tabular-nums tracking-tight text-[var(--text-primary)]" style={{ textShadow: timer.status === 'running' ? `0 0 15px ${catGlow}` : 'none', transition: 'text-shadow 0.5s ease' }}>
              {formatClock(timer.remainingMs)}
            </h2>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60 mt-1">
              {timer.mode === "focus" ? "FOCUS" : "BREAK"}
            </span>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-4 flex items-center gap-3 bg-[var(--bg-elevated)]/90 backdrop-blur-md rounded-full p-1.5 border border-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300 z-50">
          {showStart ? (
            <button onClick={() => timer.mode === "focus" ? startFocusSession() : setTimer(c => startTimer(c, Date.now(), "break"))} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform" style={{ backgroundColor: catColor }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>
          ) : (
            <>
              <button onClick={() => setTimer(c => showPause ? pauseTimer(c, Date.now()) : resumeTimer(c, Date.now()))} className="w-8 h-8 rounded-full bg-[var(--bg-surface)] text-[var(--accent)] flex items-center justify-center hover:bg-white/10 hover:scale-105 active:scale-95 transition-transform">
                {showPause ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>}
              </button>
              <button onClick={() => setTimer(c => stopTimer(c))} className="w-8 h-8 rounded-full text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center hover:bg-white/10 hover:scale-105 active:scale-95 transition-transform">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg>
              </button>
            </>
          )}
          <button onClick={onExpand} className="w-8 h-8 rounded-full text-[var(--text-muted)] hover:text-white flex items-center justify-center hover:bg-white/10 ml-1 border-l border-white/10 pl-2 rounded-l-none" title="Expand">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Breathing Ritual Layer */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-30 ${isRitualActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {renderRitual && (
          <BreathingRitualCard
            durationMs={trayMode ? TRAY_MINI_RITUAL_DURATION_MS : ritualDurationMs}
            compact={trayMode}
            forceReducedMotion={trayMode}
            onComplete={completeRitualAndStart}
            onSkip={completeRitualAndStart}
          />
        )}
      </div>

      {/* Completion Layer */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-20 ${isCompleted && !isRitualActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {renderCompletion && !isRitualActive && (
          <CompletionState
            mode={timer.mode}
            autoStartBreak={pendingAutoBreakRef.current}
            onDismiss={() => {
              pendingAutoBreakRef.current = false;
              setActiveCompletionKey(null);
              if (timer.mode === "break") {
                setIntention(lastIntentionRef.current);
                setTimer((current) => setMode(current, "focus"));
              } else {
                setTimer((current) => stopTimer(current));
              }
            }}
            onStartBreak={() => {
              pendingAutoBreakRef.current = false;
              setActiveCompletionKey(`break-${Date.now()}`);
              setTimer((current) => startTimer(current, Date.now(), "break"));
            }}
            onStartFocus={() => {
              pendingAutoBreakRef.current = false;
              setIntention(lastIntentionRef.current);
              setActiveCompletionKey(`focus-${Date.now()}`);
              setTimer((current) => startTimer(current, Date.now(), "focus"));
            }}
          />
        )}
      </div>

      {/* Timer Layer */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-10 ${showTimer ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex h-full flex-col items-center justify-between pb-8 pt-4 relative">
          {/* Orb background effect */}
          <div 
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[80px]"
            style={{
              width: 'min(100vw, 400px)',
              height: 'min(100vw, 400px)',
              background: timer.status === 'running' ? catGlow : 'transparent',
              transition: 'background 1s ease'
            }}
          />

          {/* Top Section: Intention and Category */}
          <div className="z-20 w-full mb-6 flex flex-col items-center shrink-0 min-h-[88px]">
            {timer.mode !== "break" && (
              <>
                <CategorySelector 
                  categories={categories} 
                  selectedId={categoryId} 
                  onChange={setCategoryId} 
                  disabled={timer.status === "running"}
                />
                {timer.status === "idle" || timer.status === "stopped" || timer.status === "paused" ? (
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={intention}
                      onChange={(e) => setIntention(e.target.value)}
                      placeholder="What are you working on?"
                      className="mt-4 w-full max-w-[280px] rounded-lg border border-transparent bg-transparent px-4 py-2 text-xl font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-subtle)] focus:bg-[var(--bg-elevated)] transition-all text-center"
                    />
                    {todayFocusMs > 0 && (
                      <span className="mt-2 text-xs font-medium text-[var(--text-secondary)] opacity-70">
                        {Math.round(todayFocusMs / 60000)}m focused today
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 mt-4">
                    {intention ? (
                      <span className="text-xl font-medium text-[var(--text-primary)]">
                        {intention}
                      </span>
                    ) : (
                      <span className="text-xl font-medium text-[var(--text-muted)] opacity-60 italic">
                        No intention set
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Timer Circle Container */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full min-h-[300px]">
            <div className="relative flex items-center justify-center w-[280px] h-[280px] mb-6 group">
              <svg width="280" height="280" className="absolute top-0 left-0 -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  fill="transparent"
                  stroke="var(--bg-elevated)"
                  strokeWidth="12"
                />
                {/* Progress Ring */}
                {timer.status !== "idle" && timer.status !== "stopped" && (
                  <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    fill="transparent"
                    stroke={catColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    className="timer-ring-circle"
                    style={{ filter: `drop-shadow(0 0 8px ${catGlow})` }}
                  />
                )}
              </svg>

              {/* Text perfectly centered inside the Timer Ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {timer.status !== "completed" && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-2 mt-[-10px] opacity-70">
                    {timer.mode === "focus" ? "FOCUS" : "BREAK"}
                  </span>
                )}
                <h2 
                  className="text-6xl font-light tabular-nums tracking-tight text-[var(--text-primary)]"
                  style={{ 
                    fontFamily: "'Outfit', sans-serif",
                    textShadow: timer.status === 'running' ? `0 0 20px ${catGlow}` : 'none', 
                    transition: 'text-shadow 0.5s ease' 
                  }}
                >
                  {formatClock(timer.remainingMs)}
                </h2>
                
                {/* Adjust Time Buttons */}
                {timer.status !== "completed" && timer.status !== "stopped" && (
                  <div className="flex gap-4 mt-4 transition-opacity duration-300 opacity-0 hover:opacity-100 group-hover:opacity-100 absolute bottom-12">
                    <button
                      type="button"
                      onClick={() => setTimer(c => adjustTime(c, -5 * 60 * 1000, Date.now()))}
                      className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)] transition-colors border border-[var(--border-subtle)] shadow-sm"
                      aria-label="Subtract 5 minutes"
                    >
                      -5m
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimer(c => adjustTime(c, 5 * 60 * 1000, Date.now()))}
                      className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)] transition-colors border border-[var(--border-subtle)] shadow-sm"
                      aria-label="Add 5 minutes"
                    >
                      +5m
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Control Buttons (Play, Pause, Stop) */}
            <div className="flex items-center gap-6 mt-2">
              {showStart ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 450, damping: 17 }}
                  onClick={() => {
                    if (timer.mode === "focus") {
                      startFocusSession();
                      return;
                    }
                    setActiveCompletionKey(`break-${Date.now()}`);
                    setTimer((current) => startTimer(current, Date.now(), "break"));
                  }}
                  className="flex items-center justify-center w-16 h-16 rounded-full text-white cursor-pointer shadow-lg"
                  style={{ backgroundColor: catColor, boxShadow: `0 4px 20px ${catGlow}` }}
                  aria-label="Start Timer"
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </motion.button>
              ) : null}

              {showPause || showResume ? (
                <>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 450, damping: 17 }}
                    onClick={() => setTimer((current) => showPause ? pauseTimer(current, Date.now()) : resumeTimer(current, Date.now()))}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-elevated)] text-[var(--accent)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] cursor-pointer shadow-md"
                    aria-label={showPause ? "Pause Timer" : "Resume Timer"}
                  >
                    {showPause ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 450, damping: 17 }}
                    onClick={() => {
                      setTimer((current) => stopTimer(current));
                    }}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-transparent text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                    aria-label="Stop Timer"
                  >
                    <Square className="w-5 h-5 fill-current" />
                  </motion.button>
                </>
              ) : null}
            </div>
          </div>

          {/* Recovery / Error Messages */}
          {pendingRecovery ? (
            <div className="glass-premium hover-glow absolute z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl px-6 py-5 text-sm text-[var(--text-secondary)] shadow-2xl max-w-[320px] text-center backdrop-blur-md bg-black/40 border border-white/10 w-[90%]">
              <p className="mb-4 text-white text-base font-medium">Session interrupted</p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={resumeFromCheckpoint}
                  className="rounded-full bg-[var(--bg-elevated)] px-4 py-1.5 text-xs font-medium text-white hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={dismissRecovery}
                  className="rounded-full px-4 py-1.5 text-xs font-medium hover:bg-[var(--bg-elevated)] border border-transparent"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {timer.lastError ? (
            <div className="glass-premium hover-glow absolute z-[100] top-4 left-1/2 -translate-x-1/2 rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] shadow-lg flex items-center gap-3">
              <span className="whitespace-nowrap">{timer.lastError}</span>
              <button 
                onClick={() => setTimer(current => ({ ...current, lastError: null }))}
                className="p-1 -mr-1 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                aria-label="Close error"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ) : null}
          

        </div>
      </div>
    </div>
  );
}
