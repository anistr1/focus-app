import { buildAnalyticsSummary } from "../analytics/analytics-summary";
import { readSessionHistory } from "../sessions/session-history";
import { readSettings } from "./settings-state";

export type TelemetryExportSummary = {
  schemaVersion: 1;
  generatedAtIso: string;
  telemetryEnabled: boolean;
  sessionMetrics: {
    completedSessions: number;
    totalFocusMinutes: number;
    averageSessionMinutes: number;
  };
  streakMetrics: {
    currentDays: number;
    longestDays: number;
  };
  trendMetrics: {
    todayMinutes: number;
    monthMinutes: number;
    weeklyMinutes: number[];
  };
  preferenceMetrics: {
    focusDurationMinutes: number;
    breakDurationMinutes: number;
    breathingEnabled: boolean;
    breathingDurationSeconds: number;
    animationIntensity: "full" | "reduced" | "minimal";
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    launchOnStartup: boolean;
    minimizeToTrayOnClose: boolean;
  };
};

export function buildTelemetryExport(nowMs: number = Date.now()): TelemetryExportSummary {
  const sessions = readSessionHistory();
  const settings = readSettings();
  const analytics = buildAnalyticsSummary(sessions, nowMs);
  const totalFocusMinutes = Math.round(
    sessions.filter((session) => session.completed).reduce((sum, session) => sum + session.durationMs, 0) / 60000
  );

  return {
    schemaVersion: 1,
    generatedAtIso: new Date(nowMs).toISOString(),
    telemetryEnabled: settings.telemetryOptIn,
    sessionMetrics: {
      completedSessions: analytics.totalCompletedSessions,
      totalFocusMinutes,
      averageSessionMinutes:
        analytics.totalCompletedSessions === 0
          ? 0
          : Math.round(totalFocusMinutes / analytics.totalCompletedSessions)
    },
    streakMetrics: {
      currentDays: analytics.currentStreakDays,
      longestDays: analytics.longestStreakDays
    },
    trendMetrics: {
      todayMinutes: Math.round(analytics.todayTotalMs / 60000),
      monthMinutes: Math.round(analytics.monthTotalMs / 60000),
      weeklyMinutes: analytics.weeklyTrend.map((item) => item.minutes)
    },
    preferenceMetrics: {
      focusDurationMinutes: settings.focusDurationMinutes,
      breakDurationMinutes: settings.breakDurationMinutes,
      breathingEnabled: settings.breathingEnabled,
      breathingDurationSeconds: settings.breathingDurationSeconds,
      animationIntensity: settings.animationIntensity,
      soundEnabled: settings.soundEnabled,
      notificationsEnabled: settings.notificationsEnabled,
      launchOnStartup: settings.launchOnStartup,
      minimizeToTrayOnClose: settings.minimizeToTrayOnClose
    }
  };
}

export function downloadTelemetryExport(nowMs: number = Date.now()): void {
  const payload = buildTelemetryExport(nowMs);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `focus-app-telemetry-summary-${new Date(nowMs).toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
