import { useEffect, useMemo, useState } from "react";
import { createBreathingRitual, getCurrentPhase } from "../../features/breathing/breathing-engine";
import { usePrefersReducedMotion } from "../../features/accessibility/use-prefers-reduced-motion";
import { readSettings } from "../../features/settings/settings-state";

type BreathingRitualCardProps = {
  durationMs: number;
  onComplete: () => void;
  onSkip: () => void;
  compact?: boolean;
  forceReducedMotion?: boolean;
};

function phaseTitle(phase: string): string {
  if (phase === "inhale") {
    return "Breathe in";
  }
  if (phase === "hold" || phase === "hold-out") {
    return "Hold";
  }
  return "Breathe out";
}

export function BreathingRitualCard({
  durationMs,
  onComplete,
  onSkip,
  compact = false,
  forceReducedMotion = false
}: BreathingRitualCardProps) {
  const ritual = useMemo(() => createBreathingRitual(durationMs), [durationMs]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animationIntensity =
    forceReducedMotion || prefersReducedMotion ? "minimal" : readSettings().animationIntensity;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedMs((current) => {
        const next = current + 250;
        if (next >= ritual.totalDurationMs) {
          window.clearInterval(interval);
          onComplete();
          return ritual.totalDurationMs;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [onComplete, ritual.totalDurationMs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === " ") {
        event.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSkip]);

  const phase = getCurrentPhase(ritual, elapsedMs);
  const remainingSeconds = Math.max(0, Math.ceil((ritual.totalDurationMs - elapsedMs) / 1000));

  if (compact) {
    return (
      <div className="flex h-full flex-col items-center justify-center pt-8">
        <h2 className="mt-2 text-2xl font-semibold tracking-tight" aria-live="polite">
          {phaseTitle(phase.name)}
        </h2>
        <div className="mt-8 flex justify-center">
          <div
            aria-hidden="true"
            className={`breathing-circle h-20 w-20 rounded-full phase-${phase.name} animation-${animationIntensity}`}
          />
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="mt-8 rounded-full px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)] transition-colors"
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center pt-12 pb-16">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-light tracking-tight text-white mb-16" aria-live="polite">
          {phaseTitle(phase.name)}
        </h2>

        <div className="relative flex justify-center items-center">
          {/* Inner circle - colors controlled via CSS phase classes */}
          <div
            aria-hidden="true"
            className={`breathing-circle relative z-10 h-48 w-48 rounded-full phase-${phase.name} animation-${animationIntensity}`}
          />
        </div>
      </div>

      <div className="flex flex-col items-center shrink-0">
        <p className="text-sm font-medium tabular-nums text-[var(--text-secondary)] mb-6 opacity-80" aria-live="polite">
          {remainingSeconds}s
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] transition-all"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
