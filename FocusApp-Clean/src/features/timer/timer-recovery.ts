import type { TimerMode } from "./timer-domain";

export const TIMER_CHECKPOINT_KEY = "focus-app:timer-checkpoint";
const MAX_CHECKPOINT_AGE_MS = 60 * 60 * 1000;

export type TimerCheckpoint = {
  mode: TimerMode;
  remainingMs: number;
  checkpointedAtMs: number;
  targetTimeMs: number;
};

export function createSessionCheckpoint(checkpoint: TimerCheckpoint): TimerCheckpoint {
  return checkpoint;
}

export function isCheckpointStale(checkpoint: TimerCheckpoint, nowMs: number): boolean {
  return nowMs - checkpoint.checkpointedAtMs > MAX_CHECKPOINT_AGE_MS;
}

export function getRecoverableCheckpoint(
  checkpoint: TimerCheckpoint | null,
  nowMs: number
): TimerCheckpoint | null {
  if (!checkpoint) {
    return null;
  }
  if (isCheckpointStale(checkpoint, nowMs)) {
    return null;
  }
  if (checkpoint.remainingMs <= 0 || checkpoint.targetTimeMs <= nowMs) {
    return null;
  }
  return checkpoint;
}

export function readCheckpoint(nowMs: number): TimerCheckpoint | null {
  try {
    const raw = window.localStorage.getItem(TIMER_CHECKPOINT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<TimerCheckpoint>;
    if (
      (parsed.mode !== "focus" && parsed.mode !== "break") ||
      typeof parsed.remainingMs !== "number" ||
      typeof parsed.checkpointedAtMs !== "number" ||
      typeof parsed.targetTimeMs !== "number"
    ) {
      return null;
    }
    return getRecoverableCheckpoint(parsed as TimerCheckpoint, nowMs);
  } catch {
    return null;
  }
}

export function writeCheckpoint(checkpoint: TimerCheckpoint): void {
  try {
    window.localStorage.setItem(TIMER_CHECKPOINT_KEY, JSON.stringify(checkpoint));
  } catch {
    // Keep session running even if persistence fails.
  }
}

export function clearCheckpoint(): void {
  try {
    window.localStorage.removeItem(TIMER_CHECKPOINT_KEY);
  } catch {
    // Ignore local storage cleanup failures to keep UX non-blocking.
  }
}
