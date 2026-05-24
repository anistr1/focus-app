import { describe, expect, it } from "vitest";
import {
  applyTrayAction,
  createTimerState,
  getRemainingMs,
  pauseTimer,
  resetTimer,
  resumeTimer,
  startTimer,
  stopTimer
} from "./timer-domain";

describe("timer domain", () => {
  it("supports start, pause, resume, stop, and reset transitions", () => {
    const initial = createTimerState(25 * 60 * 1000, 5 * 60 * 1000);
    const started = startTimer(initial, 0);
    expect(started.status).toBe("running");
    expect(started.mode).toBe("focus");

    const paused = pauseTimer(started, 5_000);
    expect(paused.status).toBe("paused");
    expect(paused.remainingMs).toBe(25 * 60 * 1000 - 5_000);

    const resumed = resumeTimer(paused, 8_000);
    expect(resumed.status).toBe("running");

    const stopped = stopTimer(resumed);
    expect(stopped.status).toBe("stopped");

    const reset = resetTimer(stopped);
    expect(reset.status).toBe("idle");
    expect(reset.remainingMs).toBe(25 * 60 * 1000);
  });

  it("uses timestamp math to derive remaining time", () => {
    const initial = createTimerState(25 * 60 * 1000, 5 * 60 * 1000);
    const started = startTimer(initial, 100_000);
    expect(getRemainingMs(started, 101_500)).toBe(25 * 60 * 1000 - 1_500);
  });

  it("recalculates correctly after sleep/resume-like jumps", () => {
    const initial = createTimerState(25 * 60 * 1000, 5 * 60 * 1000);
    const started = startTimer(initial, 10_000);
    const paused = pauseTimer(started, 20_000);
    const resumed = resumeTimer(paused, 1_000_000);

    expect(getRemainingMs(resumed, 1_000_500)).toBe(25 * 60 * 1000 - 10_500);
  });

  it("maps tray actions into shared timer state transitions", () => {
    const now = 10_000;
    let state = createTimerState(1_500_000, 300_000);

    state = applyTrayAction(state, "start", now);
    expect(state.mode).toBe("focus");
    expect(state.status).toBe("running");

    state = applyTrayAction(state, "pause", now + 2_000);
    expect(state.status).toBe("paused");

    state = applyTrayAction(state, "resume", now + 3_000);
    expect(state.status).toBe("running");

    state = applyTrayAction(state, "quick-break", now + 4_000);
    expect(state.mode).toBe("break");
    expect(state.status).toBe("running");
  });
});
