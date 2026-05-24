import { describe, expect, it, vi } from "vitest";
import { buildTelemetryExport, downloadTelemetryExport } from "./telemetry-export";
import { createSessionRecord, recordCompletedSession } from "../sessions/session-history";
import { writeSettings } from "./settings-state";

describe("telemetry-export", () => {
  it("builds only approved anonymous telemetry summary fields", () => {
    window.localStorage.clear();
    recordCompletedSession(
      createSessionRecord({
        durationMs: 25 * 60 * 1000,
        completedAtMs: Date.UTC(2026, 4, 24, 12, 0, 0),
        completionKey: "focus-1"
      })
    );
    writeSettings({
      focusDurationMinutes: 45,
      breakDurationMinutes: 10,
      soundEnabled: true,
      notificationsEnabled: true,
      breathingEnabled: true,
      breathingDurationSeconds: 60,
      animationIntensity: "reduced",
      telemetryOptIn: true,
      launchOnStartup: true,
      minimizeToTrayOnClose: false,
      autoStartBreak: false
    });

    const output = buildTelemetryExport(Date.UTC(2026, 4, 24, 16, 0, 0));
    expect(output.schemaVersion).toBe(1);
    expect(output.sessionMetrics.completedSessions).toBe(1);
    expect(output.preferenceMetrics.focusDurationMinutes).toBe(45);

    const serialized = JSON.stringify(output);
    expect(serialized).not.toMatch(/windowTitle|keystroke|activeApplication|completionKey|id/);
  });

  it("downloads local telemetry summary as json without network calls", () => {
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:test"),
      configurable: true
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true
    });
    const createSpy = vi.spyOn(URL, "createObjectURL");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const fetchSpy = vi.spyOn(window, "fetch");
    const click = vi.fn();
    const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
      click
    } as unknown as HTMLAnchorElement);

    downloadTelemetryExport(Date.UTC(2026, 4, 24, 16, 0, 0));

    expect(createSpy).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();

    createSpy.mockRestore();
    revokeSpy.mockRestore();
    fetchSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});
