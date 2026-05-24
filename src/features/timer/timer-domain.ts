export type TimerMode = "focus" | "break";
export type TimerStatus = "idle" | "running" | "paused" | "stopped" | "completed" | "error";
export type TrayAction = "start" | "pause" | "resume" | "quick-break" | "quit";

export type TimerState = {
  mode: TimerMode;
  status: TimerStatus;
  focusDurationMs: number;
  breakDurationMs: number;
  remainingMs: number;
  targetTimeMs: number | null;
  lastError: string | null;
};

const MAX_SESSION_MS = 4 * 60 * 60 * 1000;

export function createTimerState(focusDurationMs: number, breakDurationMs: number): TimerState {
  return {
    mode: "focus",
    status: "idle",
    focusDurationMs,
    breakDurationMs,
    remainingMs: focusDurationMs,
    targetTimeMs: null,
    lastError: null
  };
}

function getDurationByMode(state: TimerState): number {
  return state.mode === "focus" ? state.focusDurationMs : state.breakDurationMs;
}

export function getRemainingMs(state: TimerState, nowMs: number): number {
  if (state.status !== "running" || state.targetTimeMs === null) {
    return state.remainingMs;
  }
  return Math.max(0, state.targetTimeMs - nowMs);
}

export function tickTimer(state: TimerState, nowMs: number): TimerState {
  if (state.status !== "running") {
    return state;
  }

  const elapsed = getDurationByMode(state) - getRemainingMs(state, nowMs);
  if (elapsed > MAX_SESSION_MS) {
    return {
      ...state,
      status: "error",
      targetTimeMs: null,
      lastError: "Session paused automatically after extended runtime."
    };
  }

  const remainingMs = getRemainingMs(state, nowMs);
  if (remainingMs <= 0) {
    return {
      ...state,
      status: "completed",
      remainingMs: 0,
      targetTimeMs: null
    };
  }

  return { ...state, remainingMs };
}

export function startTimer(
  state: TimerState,
  nowMs: number,
  mode: TimerMode = "focus"
): TimerState {
  const duration = mode === "focus" ? state.focusDurationMs : state.breakDurationMs;
  return {
    ...state,
    mode,
    status: "running",
    remainingMs: duration,
    targetTimeMs: nowMs + duration,
    lastError: null
  };
}

export function pauseTimer(state: TimerState, nowMs: number): TimerState {
  if (state.status !== "running") {
    return state;
  }
  return {
    ...state,
    status: "paused",
    remainingMs: getRemainingMs(state, nowMs),
    targetTimeMs: null
  };
}

export function resumeTimer(state: TimerState, nowMs: number): TimerState {
  if (state.status !== "paused") {
    return state;
  }
  return {
    ...state,
    status: "running",
    targetTimeMs: nowMs + state.remainingMs
  };
}

export function stopTimer(state: TimerState): TimerState {
  return {
    ...state,
    status: "stopped",
    targetTimeMs: null,
    remainingMs: getDurationByMode(state)
  };
}

export function resetTimer(state: TimerState): TimerState {
  return {
    ...state,
    status: "idle",
    targetTimeMs: null,
    remainingMs: getDurationByMode(state),
    lastError: null
  };
}

export function setMode(state: TimerState, mode: TimerMode): TimerState {
  const duration = mode === "focus" ? state.focusDurationMs : state.breakDurationMs;
  return {
    ...state,
    mode,
    status: "idle",
    remainingMs: duration,
    targetTimeMs: null,
    lastError: null
  };
}

export function applyTrayAction(state: TimerState, action: TrayAction, nowMs: number): TimerState {
  if (action === "start") {
    return startTimer(state, nowMs, "focus");
  }
  if (action === "pause") {
    return pauseTimer(state, nowMs);
  }
  if (action === "resume") {
    return resumeTimer(state, nowMs);
  }
  if (action === "quick-break") {
    return startTimer(setMode(state, "break"), nowMs, "break");
  }
  return state;
}

export function adjustTime(state: TimerState, deltaMs: number, nowMs: number): TimerState {
  if (state.status === "completed" || state.status === "stopped" || state.status === "error") {
    return state;
  }
  
  if (state.status === "idle" || state.status === "paused") {
    const newRemaining = Math.max(0, state.remainingMs + deltaMs);
    return { 
      ...state, 
      remainingMs: newRemaining
    };
  }

  if (state.status === "running" && state.targetTimeMs !== null) {
    const newTarget = state.targetTimeMs + deltaMs;
    const newRemaining = Math.max(0, newTarget - nowMs);
    
    if (newRemaining <= 0) {
       return {
         ...state,
         status: "completed",
         remainingMs: 0,
         targetTimeMs: null
       };
    }
    return {
      ...state,
      targetTimeMs: newTarget,
      remainingMs: newRemaining
    };
  }
  return state;
}
