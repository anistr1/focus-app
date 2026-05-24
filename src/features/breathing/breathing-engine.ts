export type BreathingPhaseName = "inhale" | "hold" | "exhale" | "hold-out";

export type BreathingPhase = {
  name: BreathingPhaseName;
  durationMs: number;
};

export type BreathingRitual = {
  totalDurationMs: number;
  cycleMs: number;
  phases: BreathingPhase[];
};

const SUPPORTED_PRESETS = new Set([30_000, 60_000, 120_000]);

export function createBreathingRitual(durationMs: number): BreathingRitual {
  const safeDuration = SUPPORTED_PRESETS.has(durationMs) ? durationMs : 30_000;
  
  // Box Breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
  const phases: BreathingPhase[] = [
    { name: "inhale", durationMs: 4_000 },
    { name: "hold", durationMs: 4_000 },
    { name: "exhale", durationMs: 4_000 },
    { name: "hold-out", durationMs: 4_000 }
  ];

  return {
    totalDurationMs: safeDuration,
    cycleMs: phases.reduce((sum, phase) => sum + phase.durationMs, 0),
    phases
  };
}

export function getCurrentPhase(ritual: BreathingRitual, elapsedMs: number): BreathingPhase {
  const msWithinCycle = ((elapsedMs % ritual.cycleMs) + ritual.cycleMs) % ritual.cycleMs;
  let cursor = 0;
  for (const phase of ritual.phases) {
    cursor += phase.durationMs;
    if (msWithinCycle < cursor) {
      return phase;
    }
  }
  return ritual.phases[ritual.phases.length - 1];
}
