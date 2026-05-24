import { useState } from "react";
import { usePrefersReducedMotion } from "../accessibility/use-prefers-reduced-motion";
import {
  readOnboardingState,
  writeOnboardingState,
  type OnboardingState
} from "./onboarding-state";

type OnboardingFlowProps = {
  onComplete: () => void;
};

type StepDefinition = {
  title: string;
  description: string;
  canSkip: boolean;
};

const steps: StepDefinition[] = [
  {
    title: "Ready to focus?",
    description: "Welcome to a calm space for your deep work. Let's set up your environment.",
    canSkip: false
  },
  {
    title: "Default duration",
    description: "How long do you usually focus?",
    canSkip: true
  },
  {
    title: "Data privacy",
    description: "We collect local telemetry to improve the app. Keep it local on your device?",
    canSkip: false
  },
  {
    title: "Breathe before you start",
    description: "Transition into deep work with a short breathing ritual.",
    canSkip: true
  },
  {
    title: "All set.",
    description: "Your focus space is ready.",
    canSkip: false
  }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<OnboardingState>(() => readOnboardingState());
  const prefersReducedMotion = usePrefersReducedMotion();
  const isLastStep = stepIndex === steps.length - 1;
  const isTelemetryStep = stepIndex === 2;

  function handleNext() {
    if (isLastStep) {
      const completedState: OnboardingState = { ...state, completed: true };
      writeOnboardingState(completedState);
      onComplete();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function handleSkip() {
    if (!steps[stepIndex].canSkip) {
      return;
    }
    if (isLastStep) {
      const completedState: OnboardingState = { ...state, completed: true };
      writeOnboardingState(completedState);
      onComplete();
      return;
    }
    setStepIndex((current) => current + 1);
  }

  const progressPct = ((stepIndex + 1) / steps.length) * 100;

  return (
    <main className="onboarding-screen flex h-screen flex-col overflow-hidden text-[var(--text-primary)]">
      {/* Thin Progress Bar */}
      <div className="h-1 w-full bg-[var(--bg-elevated)]">
        <div 
          className="h-full bg-[var(--accent)] transition-all duration-500 ease-out" 
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <section className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-light tracking-tight mb-4" aria-live="polite">
            {steps[stepIndex].title}
          </h1>
          <p className="text-base text-[var(--text-secondary)] mb-12">
            {steps[stepIndex].description}
          </p>

          <div className="min-h-[160px] flex justify-center items-center">
            {stepIndex === 1 ? (
              <div className="grid grid-cols-3 gap-4 w-full">
                {[25, 45, 60].map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setState((current) => ({ ...current, defaultDuration: duration }))}
                    className={`rounded-2xl px-2 py-6 transition-all ${
                      state.defaultDuration === duration
                        ? "bg-[var(--accent)] text-white shadow-[0_0_20px_var(--accent-glow)] scale-105"
                        : "glass-panel text-[var(--text-secondary)] hover:text-white hover:scale-105"
                    }`}
                  >
                    <span className="text-2xl font-light block mb-1">{duration}</span>
                    <span className="text-xs uppercase tracking-wider opacity-80">min</span>
                  </button>
                ))}
              </div>
            ) : null}

            {isTelemetryStep ? (
              <div className="flex flex-col gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setState((current) => ({ ...current, telemetryOptIn: true }))}
                  className={`rounded-2xl px-6 py-4 text-left transition-all ${
                    state.telemetryOptIn === true
                      ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                      : "glass-panel text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Yes, allow local telemetry
                </button>
                <button
                  type="button"
                  onClick={() => setState((current) => ({ ...current, telemetryOptIn: false }))}
                  className={`rounded-2xl px-6 py-4 text-left transition-all ${
                    state.telemetryOptIn === false
                      ? "border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-white"
                      : "glass-panel text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  No thanks
                </button>
              </div>
            ) : null}

            {stepIndex === 3 ? (
              <div className="relative flex justify-center items-center">
                <div className={`absolute h-48 w-48 rounded-full bg-[var(--gradient-breath-start)] blur-xl opacity-20 ${prefersReducedMotion ? "" : "onboarding-breath"}`} />
                <div
                  aria-hidden="true"
                  className={`relative z-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,var(--gradient-breath-end),var(--gradient-breath-start))] ${
                    prefersReducedMotion ? "onboarding-breath-static" : "onboarding-breath"
                  } shadow-[0_0_30px_rgba(255,100,50,0.15)]`}
                />
              </div>
            ) : null}

            {stepIndex === 4 ? (
              <div className="text-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p className="text-sm text-[var(--text-secondary)]">
                  Use <kbd className="font-sans px-2 py-1 bg-[var(--bg-elevated)] rounded mx-1">Ctrl+Shift+F</kbd> anytime to start.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="flex shrink-0 items-center justify-between px-8 pb-12 pt-4">
        <div className="flex gap-2">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full px-6 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Back
            </button>
          ) : <div className="w-20" />}
          {steps[stepIndex].canSkip ? (
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-full px-6 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Skip
            </button>
          ) : null}
        </div>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={isTelemetryStep && state.telemetryOptIn === null}
          className="rounded-full bg-[var(--accent)] px-10 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_var(--accent-glow)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
        >
          {isLastStep ? "Start session" : "Continue"}
        </button>
      </footer>
    </main>
  );
}
