import { describe, expect, it } from "vitest";
import { createBreathingRitual, getCurrentPhase } from "./breathing-engine";

describe("breathing ritual engine", () => {
  it("supports preset durations for 30s, 60s, and 120s", () => {
    expect(createBreathingRitual(30_000).totalDurationMs).toBe(30_000);
    expect(createBreathingRitual(60_000).totalDurationMs).toBe(60_000);
    expect(createBreathingRitual(120_000).totalDurationMs).toBe(120_000);
  });

  it("cycles through inhale, hold, and exhale in order", () => {
    const ritual = createBreathingRitual(30_000);
    expect(getCurrentPhase(ritual, 0).name).toBe("inhale");
    expect(getCurrentPhase(ritual, 4_500).name).toBe("hold");
    expect(getCurrentPhase(ritual, 8_500).name).toBe("exhale");
    expect(getCurrentPhase(ritual, 12_500).name).toBe("hold-out");
  });
});
