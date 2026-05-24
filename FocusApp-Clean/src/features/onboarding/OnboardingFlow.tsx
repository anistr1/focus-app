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
    title: "Your focus ritual starts here.",
    description:
      "Set up your default focus flow in under two minutes and jump straight into your first session.",
    canSkip: false
  },
  {
    title: "Choose your default focus duration",
    description: "Pick the session length that feels natural. You can change this later in settings.",
    canSkip: true
  },
  {
    title: "Help improve Focus app with local telemetry",
    description:
      "This stays local on your device. Choose whether anonymized session metrics can be included in local exports.",
    canSkip: false
  },
  {
    title: "Try a short breathing preview",
    description:
      "Preview the breathing ritual with calm motion before your first timer run. Press Space or Esc to skip during real sessions.",
    canSkip: true
  },
  {
    title: "Your timer is ready",
    description: "Your first-run setup is complete. Enter the dashboard whenever you're ready.",
    canSkip: true
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
    setStepIndex((current) => current + 1);
  }

  return (
    <main className="onboarding-screen min-h-screen px-5 py-8 text-[var(--text-primary)]">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center">
        <article className="w-full rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight" aria-live="polite">
            {steps[stepIndex].title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
            {steps[stepIndex].description}
          </p>

          {stepIndex === 1 ? (
            <fieldset className="mt-8" aria-label="Default duration options">
              <legend className="mb-3 text-sm text-[var(--text-secondary)]">Default duration</legend>
              <div className="grid grid-cols-3 gap-3">
                {[25, 45, 60].map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    aria-pressed={state.defaultDuration === duration}
                    aria-label={`Use ${duration} minute default duration`}
                    onClick={() => setState((current) => ({ ...current, defaultDuration: duration }))}
                    className={`rounded-xl border px-4 py-3 text-sm transition ${
                      state.defaultDuration === duration
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {isTelemetryStep ? (
            <fieldset className="mt-8" aria-label="Telemetry preference options">
              <legend className="mb-3 text-sm text-[var(--text-secondary)]">Telemetry preference</legend>
              <div className="grid gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
                  <input
                    type="radio"
                    name="telemetry-choice"
                    checked={state.telemetryOptIn === true}
                    onChange={() => setState((current) => ({ ...current, telemetryOptIn: true }))}
                  />
                  <span>Yes, allow local telemetry</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
                  <input
                    type="radio"
                    name="telemetry-choice"
                    checked={state.telemetryOptIn === false}
                    onChange={() => setState((current) => ({ ...current, telemetryOptIn: false }))}
                  />
                  <span>No thanks</span>
                </label>
              </div>
            </fieldset>
          ) : null}

          {stepIndex === 3 ? (
            <div
              aria-hidden="true"
              className={`mt-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,var(--gradient-breath-end),var(--gradient-breath-start))] ${
                prefersReducedMotion ? "onboarding-breath-static" : "onboarding-breath"
              }`}
            />
          ) : null}

          {stepIndex === 4 ? (
            <p className="mt-8 text-sm text-[var(--accent)]">
              Tip: Press Ctrl+Shift+F anytime to start focus.
            </p>
          ) : null}

          <div className="mt-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm text-[var(--text-secondary)]"
                >
                  Back
                </button>
              ) : null}
              {steps[stepIndex].canSkip ? (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-[var(--text-secondary)] underline-offset-4 hover:underline"
                >
                  Skip
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={isTelemetryStep && state.telemetryOptIn === null}
              className="rounded-xl bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--bg-base)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastStep ? "Enter your focus dashboard" : "Continue"}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
