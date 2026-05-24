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
  if (phase === "hold") {
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
  const containerClassName = compact
    ? "rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
    : "rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]";
  const headingClassName = compact ? "mt-2 text-2xl font-semibold tracking-tight" : "mt-3 text-3xl font-semibold tracking-tight";
  const circleSizeClassName = compact ? "h-20 w-20" : "h-28 w-28";
  const spacingClassName = compact ? "mt-5" : "mt-8";
  const label = compact ? "Mini Ritual" : "Breathing Ritual";

  return (
    <article className={containerClassName}>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">{label}</p>
      <h2 className={headingClassName} aria-live="polite">
        {phaseTitle(phase.name)}
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]" aria-live="polite">
        {remainingSeconds}s remaining - Press Space or Esc to skip
      </p>

      <div className={`${spacingClassName} flex justify-center`}>
        <div
          aria-hidden="true"
          className={`breathing-circle ${circleSizeClassName} rounded-full bg-[radial-gradient(circle,var(--gradient-breath-end),var(--gradient-breath-start))] phase-${phase.name} animation-${animationIntensity}`}
        />
      </div>

      <div className={`${spacingClassName} flex justify-center`}>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-secondary)]"
        >
          Skip Ritual
        </button>
      </div>
    </article>
  );
}
