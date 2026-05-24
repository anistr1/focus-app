import { readOnboardingState } from "../onboarding/onboarding-state";

export const SETTINGS_KEY = "focus-app:settings";
export const SETTINGS_UPDATED_EVENT = "focus-app:settings-updated";

export type AnimationIntensity = "full" | "reduced" | "minimal";

export type AppSettings = {
  focusDurationMinutes: 25 | 45 | 60;
  breakDurationMinutes: 5 | 10 | 15;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  breathingEnabled: boolean;
  breathingDurationSeconds: 30 | 60 | 120;
  animationIntensity: AnimationIntensity;
  telemetryOptIn: boolean;
  launchOnStartup: boolean;
  minimizeToTrayOnClose: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  focusDurationMinutes: 25,
  breakDurationMinutes: 5,
  soundEnabled: true,
  notificationsEnabled: true,
  breathingEnabled: true,
  breathingDurationSeconds: 30,
  animationIntensity: "full",
  telemetryOptIn: false,
  launchOnStartup: false,
  minimizeToTrayOnClose: false
};

function normalize(input: Partial<AppSettings>): AppSettings {
  return {
    focusDurationMinutes:
      input.focusDurationMinutes === 45 || input.focusDurationMinutes === 60
        ? input.focusDurationMinutes
        : 25,
    breakDurationMinutes:
      input.breakDurationMinutes === 10 || input.breakDurationMinutes === 15
        ? input.breakDurationMinutes
        : 5,
    soundEnabled: input.soundEnabled !== false,
    notificationsEnabled: input.notificationsEnabled !== false,
    breathingEnabled: input.breathingEnabled !== false,
    breathingDurationSeconds:
      input.breathingDurationSeconds === 60 || input.breathingDurationSeconds === 120
        ? input.breathingDurationSeconds
        : 30,
    animationIntensity:
      input.animationIntensity === "reduced" || input.animationIntensity === "minimal"
        ? input.animationIntensity
        : "full",
    telemetryOptIn: input.telemetryOptIn === true,
    launchOnStartup: input.launchOnStartup === true,
    minimizeToTrayOnClose: input.minimizeToTrayOnClose === true
  };
}

export function readSettings(): AppSettings {
  const onboarding = readOnboardingState();
  const onboardingDuration: 25 | 45 | 60 =
    onboarding.defaultDuration === 45 || onboarding.defaultDuration === 60 ? onboarding.defaultDuration : 25;
  const onboardingDefaults: Partial<AppSettings> = {
    focusDurationMinutes: onboardingDuration,
    telemetryOptIn: onboarding.telemetryOptIn === true
  };

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return normalize({ ...DEFAULT_SETTINGS, ...onboardingDefaults });
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return normalize({ ...DEFAULT_SETTINGS, ...onboardingDefaults, ...parsed });
  } catch {
    return normalize({ ...DEFAULT_SETTINGS, ...onboardingDefaults });
  }
}

export function writeSettings(settings: AppSettings): void {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT));
}
