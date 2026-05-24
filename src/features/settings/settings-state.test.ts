import { describe, expect, it } from "vitest";
import { readSettings, SETTINGS_KEY, writeSettings } from "./settings-state";

describe("settings-state", () => {
  it("hydrates defaults from onboarding state when settings are missing", () => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "focus-app:onboarding-state",
      JSON.stringify({ completed: true, defaultDuration: 45, telemetryOptIn: true })
    );

    const settings = readSettings();
    expect(settings.focusDurationMinutes).toBe(45);
    expect(settings.telemetryOptIn).toBe(true);
  });

  it("persists and rehydrates settings", () => {
    window.localStorage.clear();
    writeSettings({
      focusDurationMinutes: 60,
      breakDurationMinutes: 15,
      soundEnabled: false,
      notificationsEnabled: false,
      breathingEnabled: false,
      breathingDurationSeconds: 120,
      animationIntensity: "minimal",
      telemetryOptIn: true,
      launchOnStartup: true,
      minimizeToTrayOnClose: true,
      autoStartBreak: false
    });

    const raw = window.localStorage.getItem(SETTINGS_KEY);
    expect(raw).not.toBeNull();
    const settings = readSettings();
    expect(settings.breakDurationMinutes).toBe(15);
    expect(settings.animationIntensity).toBe("minimal");
    expect(settings.launchOnStartup).toBe(true);
  });
});
