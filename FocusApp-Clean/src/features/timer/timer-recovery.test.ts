import { describe, expect, it } from "vitest";
import {
  createSessionCheckpoint,
  getRecoverableCheckpoint,
  isCheckpointStale
} from "./timer-recovery";

describe("timer recovery", () => {
  it("creates checkpoint payload with timestamp-based recovery fields", () => {
    const checkpoint = createSessionCheckpoint({
      mode: "focus",
      remainingMs: 1_200_000,
      checkpointedAtMs: 100_000,
      targetTimeMs: 1_300_000
    });

    expect(checkpoint.mode).toBe("focus");
    expect(checkpoint.remainingMs).toBe(1_200_000);
    expect(checkpoint.targetTimeMs).toBe(1_300_000);
  });

  it("rejects stale checkpoints and accepts fresh ones", () => {
    const stale = createSessionCheckpoint({
      mode: "focus",
      remainingMs: 600_000,
      checkpointedAtMs: 0,
      targetTimeMs: 600_000
    });

    expect(isCheckpointStale(stale, 2 * 60 * 60 * 1000)).toBe(true);

    const fresh = createSessionCheckpoint({
      mode: "focus",
      remainingMs: 600_000,
      checkpointedAtMs: 100_000,
      targetTimeMs: 700_000
    });

    expect(getRecoverableCheckpoint(fresh, 120_000)).not.toBeNull();
  });
});
