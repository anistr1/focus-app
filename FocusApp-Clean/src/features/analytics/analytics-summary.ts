import type { SessionRecord } from "../sessions/session-history";

export type AnalyticsPoint = {
  dayLabel: string;
  minutes: number;
};

export type AnalyticsSummary = {
  todayTotalMs: number;
  monthTotalMs: number;
  totalCompletedSessions: number;
  currentStreakDays: number;
  longestStreakDays: number;
  weeklyTrend: AnalyticsPoint[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayStart(timestampMs: number): number {
  const date = new Date(timestampMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayLabel(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString(undefined, { weekday: "short" });
}

export function buildAnalyticsSummary(
  records: SessionRecord[],
  nowMs: number = Date.now()
): AnalyticsSummary {
  const perDay = new Map<number, number>();
  for (const record of records) {
    if (!record.completed) {
      continue;
    }
    const key = dayStart(record.completedAtMs);
    perDay.set(key, (perDay.get(key) ?? 0) + record.durationMs);
  }

  const today = dayStart(nowMs);
  const todayTotalMs = perDay.get(today) ?? 0;
  const monthDate = new Date(nowMs);
  const month = monthDate.getMonth();
  const year = monthDate.getFullYear();

  let monthTotalMs = 0;
  for (const [key, total] of perDay) {
    const date = new Date(key);
    if (date.getFullYear() === year && date.getMonth() === month) {
      monthTotalMs += total;
    }
  }

  const weeklyTrend: AnalyticsPoint[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dayMs = today - i * DAY_MS;
    weeklyTrend.push({
      dayLabel: dayLabel(dayMs),
      minutes: Math.round((perDay.get(dayMs) ?? 0) / 60000)
    });
  }

  const sortedDays = Array.from(perDay.keys()).sort((a, b) => a - b);
  let longestStreakDays = 0;
  let currentRun = 0;
  let previousDay = Number.NaN;
  for (const value of sortedDays) {
    currentRun = Number.isNaN(previousDay) || value - previousDay !== DAY_MS ? 1 : currentRun + 1;
    longestStreakDays = Math.max(longestStreakDays, currentRun);
    previousDay = value;
  }

  let currentStreakDays = 0;
  for (let cursor = today; perDay.has(cursor); cursor -= DAY_MS) {
    currentStreakDays += 1;
  }

  return {
    todayTotalMs,
    monthTotalMs,
    totalCompletedSessions: records.filter((entry) => entry.completed).length,
    currentStreakDays,
    longestStreakDays,
    weeklyTrend
  };
}
