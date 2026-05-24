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

const BREATHING_BENEFITS = [
  "A single deep breath can lower your heart rate and reset your focus.",
  "Stillness isn't empty. It's full of clarity and potential.",
  "Every exhale releases tension. Every inhale brings fresh energy.",
  "Breathing deeply signals your nervous system to relax and recharge.",
  "Take this moment to ground yourself before diving back into deep work."
];

export function BreathingRitualCard({
  durationMs,
  onComplete,
  onSkip,
  compact = false,
  forceReducedMotion = false
}: BreathingRitualCardProps) {
  const ritual = useMemo(() => createBreathingRitual(durationMs), [durationMs]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [phaseState, setPhaseState] = useState<"benefit" | "prep" | "breathing">("benefit");
  const [benefitText] = useState(() => BREATHING_BENEFITS[Math.floor(Math.random() * BREATHING_BENEFITS.length)]);
  const [prepCountdown, setPrepCountdown] = useState(3);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animationIntensity =
    forceReducedMotion || prefersReducedMotion ? "minimal" : readSettings().animationIntensity;

  useEffect(() => {
    if (phaseState === "benefit") {
      const timer = window.setTimeout(() => setPhaseState("prep"), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [phaseState]);

  useEffect(() => {
    if (phaseState !== "prep") return;
    const interval = window.setInterval(() => {
      setPrepCountdown((c) => {
        if (c <= 1) {
          setPhaseState("breathing");
          window.clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phaseState]);

  useEffect(() => {
    if (phaseState !== "breathing") return;
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
  }, [onComplete, ritual.totalDurationMs, phaseState]);

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
      <div className="relative flex h-full flex-col items-center justify-center pt-8 animate-in fade-in duration-1000">
        <div className="relative flex-1 w-full flex items-center justify-center">
          {/* Benefit State */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${phaseState === "benefit" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <p className="text-sm font-medium tracking-wide text-[var(--text-secondary)] leading-relaxed max-w-xs px-4 animate-in slide-in-from-bottom-2 fade-in duration-1000 text-center" aria-live="polite">
              {benefitText}
            </p>
          </div>
          
          {/* Prep State */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 delay-300 ${phaseState === "prep" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <h2 className="text-xl font-medium tracking-tight text-center" aria-live="polite">
              Get ready... {prepCountdown > 0 ? prepCountdown : ""}
            </h2>
          </div>
          
          {/* Ritual State */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 delay-300 ${phaseState === "breathing" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <h2 className="text-2xl font-semibold tracking-tight" aria-live="polite">
              {phaseTitle(phase.name)}
            </h2>
            <div className="mt-8 flex justify-center">
              <div
                aria-hidden="true"
                className={`breathing-circle h-20 w-20 rounded-full phase-${phase.name} animation-${animationIntensity}`}
              />
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onSkip}
          className="mb-4 rounded-full px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)] transition-colors relative z-10"
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center pt-12 pb-16 animate-in fade-in zoom-in-95 duration-1000 relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center relative w-full">
        {/* BENEFIT STATE */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
            phaseState === "benefit" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <p className="text-2xl font-light tracking-wide text-[var(--text-secondary)] leading-relaxed max-w-sm px-6 animate-in slide-in-from-bottom-2 fade-in duration-1000 text-center" aria-live="polite">
            {benefitText}
          </p>
        </div>

        {/* PREPARATION STATE */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 delay-300 ${
            phaseState === "prep" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="text-3xl font-light tracking-tight text-white mb-16 max-w-[280px]" aria-live="polite">
            Be still, and bring your attention to your breath.
          </h2>
          <div className="relative flex justify-center items-center">
            <div
              aria-hidden="true"
              className={`absolute inset-0 z-0 rounded-full blur-2xl opacity-20 scale-100 bg-[var(--text-muted)] animation-${animationIntensity}`}
            />
            <div
              aria-hidden="true"
              className={`relative z-10 h-32 w-32 rounded-full bg-[var(--text-muted)] opacity-20 animation-${animationIntensity}`}
            />
            <p className="absolute inset-0 flex items-center justify-center z-20 text-4xl font-light text-white animate-pulse">
              {prepCountdown > 0 ? prepCountdown : ""}
            </p>
          </div>
        </div>

        {/* RITUAL STATE */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 delay-300 ${
            phaseState === "breathing" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 key={phase.name} className="text-4xl font-light tracking-tight text-white mb-16 animate-in fade-in duration-500" aria-live="polite">
            {phaseTitle(phase.name)}
          </h2>

          <div className="relative flex justify-center items-center">
            {/* Outer glow ring */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 z-0 rounded-full blur-2xl opacity-60 scale-125 breathing-circle phase-${phase.name} animation-${animationIntensity}`}
            />
            {/* Inner circle - colors controlled via CSS phase classes */}
            <div
              aria-hidden="true"
              className={`breathing-circle relative z-10 h-48 w-48 rounded-full phase-${phase.name} animation-${animationIntensity}`}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col items-center shrink-0 h-[100px] justify-end relative">
        <div 
          className={`absolute bottom-[60px] transition-opacity duration-1000 ${
            phaseState === "breathing" ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm font-medium tabular-nums text-[var(--text-secondary)] opacity-80" aria-live="polite">
            {remainingSeconds}s
          </p>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full px-6 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] transition-all relative z-10"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
