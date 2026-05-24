import { useEffect, useState } from "react";
import {
  readSettings,
  SETTINGS_UPDATED_EVENT,
  writeSettings,
  type AppSettings
} from "../../features/settings/settings-state";
import { downloadTelemetryExport } from "../../features/settings/telemetry-export";

export function SettingsCard() {
  const [settings, setSettings] = useState<AppSettings>(() => readSettings());
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setSettings(readSettings());
    window.addEventListener(SETTINGS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handler);
  }, []);

  function update(partial: Partial<AppSettings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    writeSettings(next);
  }

  function handleExport() {
    try {
      downloadTelemetryExport();
      setExportMessage("Telemetry summary exported locally as JSON.");
    } catch {
      setExportMessage("Export could not be completed right now. Please try again.");
    }
  }

  return (
    <article className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Settings</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">Core preferences</h2>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Focus duration
          <select
            aria-label="Focus Duration"
            className="mt-1 w-full rounded-md bg-[var(--bg-elevated)] px-2 py-1"
            value={settings.focusDurationMinutes}
            onChange={(event) => update({ focusDurationMinutes: Number(event.target.value) as 25 | 45 | 60 })}
          >
            <option value={25}>25 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>
        </label>

        <label className="text-sm">
          Break duration
          <select
            aria-label="Break Duration"
            className="mt-1 w-full rounded-md bg-[var(--bg-elevated)] px-2 py-1"
            value={settings.breakDurationMinutes}
            onChange={(event) => update({ breakDurationMinutes: Number(event.target.value) as 5 | 10 | 15 })}
          >
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
          </select>
        </label>

        <label className="text-sm">
          Breathing duration
          <select
            aria-label="Breathing Duration"
            className="mt-1 w-full rounded-md bg-[var(--bg-elevated)] px-2 py-1"
            value={settings.breathingDurationSeconds}
            onChange={(event) =>
              update({ breathingDurationSeconds: Number(event.target.value) as 30 | 60 | 120 })
            }
          >
            <option value={30}>30 sec</option>
            <option value={60}>60 sec</option>
            <option value={120}>120 sec</option>
          </select>
        </label>

        <label className="text-sm">
          Animation intensity
          <select
            aria-label="Animation Intensity"
            className="mt-1 w-full rounded-md bg-[var(--bg-elevated)] px-2 py-1"
            value={settings.animationIntensity}
            onChange={(event) =>
              update({ animationIntensity: event.target.value as AppSettings["animationIntensity"] })
            }
          >
            <option value="full">Full</option>
            <option value="reduced">Reduced</option>
            <option value="minimal">Minimal</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(event) => update({ soundEnabled: event.target.checked })}
          />
          Sound cues
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(event) => update({ notificationsEnabled: event.target.checked })}
          />
          Notifications
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.breathingEnabled}
            onChange={(event) => update({ breathingEnabled: event.target.checked })}
          />
          Breathing ritual before focus
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.telemetryOptIn}
            onChange={(event) => update({ telemetryOptIn: event.target.checked })}
          />
          Local telemetry summary
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.launchOnStartup}
            onChange={(event) => update({ launchOnStartup: event.target.checked })}
          />
          Launch on startup (saved for desktop integration)
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.minimizeToTrayOnClose}
            onChange={(event) => update({ minimizeToTrayOnClose: event.target.checked })}
          />
          Minimize to tray on close
        </label>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm"
        >
          Export telemetry summary (JSON)
        </button>
        {exportMessage ? (
          <p className="mt-2 text-xs text-[var(--text-secondary)]" role="status" aria-live="polite">
            {exportMessage}
          </p>
        ) : null}
      </div>
    </article>
  );
}
