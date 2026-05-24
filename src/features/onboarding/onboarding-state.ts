export type OnboardingState = {
  completed: boolean;
  defaultDuration: number;
  telemetryOptIn: boolean | null;
};

export const ONBOARDING_STATE_KEY = "focus-app:onboarding-state";

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  defaultDuration: 25,
  telemetryOptIn: null
};

export function readOnboardingState(): OnboardingState {
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STATE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return {
      completed: parsed.completed === true,
      defaultDuration:
        parsed.defaultDuration === 45 || parsed.defaultDuration === 60 ? parsed.defaultDuration : 25,
      telemetryOptIn:
        typeof parsed.telemetryOptIn === "boolean" ? parsed.telemetryOptIn : null
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function writeOnboardingState(state: OnboardingState): void {
  window.localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
}
