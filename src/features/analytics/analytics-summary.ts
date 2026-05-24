import type { SessionRecord } from "../sessions/session-history";

export type DateRangeFilter = 'today' | 'yesterday' | '7-days' | '30-days' | 'all-time';

export type AnalyticsPoint = {
  dayLabel: string;
  minutes: number;
};

export type AnalyticsSummary = {
  periodTotalMs: number;
  periodSessions: number;
  periodDailyAvgMs: number;
  currentStreakDays: number;
  longestStreakDays: number;
  trend: AnalyticsPoint[];
  categoryTotals: { categoryId: string; totalMs: number }[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function dayStart(timestampMs: number): number {
  const date = new Date(timestampMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayLabel(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString(undefined, { weekday: "short" });
}

function monthLabel(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export function buildAnalyticsSummary(
  records: SessionRecord[],
  filter: DateRangeFilter,
  nowMs: number = Date.now()
): AnalyticsSummary {
  const todayStart = dayStart(nowMs);
  
  // 1. Determine time bounds based on filter
  let minTimeMs = 0;
  let maxTimeMs = Number.MAX_SAFE_INTEGER;
  
  if (filter === 'today') {
    minTimeMs = todayStart;
    maxTimeMs = todayStart + DAY_MS - 1;
  } else if (filter === 'yesterday') {
    minTimeMs = todayStart - DAY_MS;
    maxTimeMs = todayStart - 1;
  } else if (filter === '7-days') {
    minTimeMs = todayStart - (6 * DAY_MS);
    maxTimeMs = todayStart + DAY_MS - 1;
  } else if (filter === '30-days') {
    minTimeMs = todayStart - (29 * DAY_MS);
    maxTimeMs = todayStart + DAY_MS - 1;
  }

  // 2. Filter records
  const filteredRecords = records.filter(r => 
    r.completed && r.completedAtMs >= minTimeMs && r.completedAtMs <= maxTimeMs
  );

  // 3. Compute basic stats
  let periodTotalMs = 0;
  const categoryMap = new Map<string, number>();
  const perDayAllTime = new Map<number, number>(); // Needed for streaks
  const perDayFiltered = new Map<number, number>();
  
  for (const record of records) {
    if (!record.completed) continue;
    
    // Streaks use ALL records
    const dayKey = dayStart(record.completedAtMs);
    perDayAllTime.set(dayKey, (perDayAllTime.get(dayKey) ?? 0) + record.durationMs);

    // If within our filter
    if (record.completedAtMs >= minTimeMs && record.completedAtMs <= maxTimeMs) {
      periodTotalMs += record.durationMs;
      const catId = record.categoryId || "uncategorized";
      categoryMap.set(catId, (categoryMap.get(catId) ?? 0) + record.durationMs);
      perDayFiltered.set(dayKey, (perDayFiltered.get(dayKey) ?? 0) + record.durationMs);
    }
  }

  // 4. Calculate trend
  const trend: AnalyticsPoint[] = [];
  let daysInPeriod = 1;

  if (filter === 'today') {
    daysInPeriod = 1;
    trend.push({ dayLabel: 'Today', minutes: Math.round(periodTotalMs / 60000) });
  } else if (filter === 'yesterday') {
    daysInPeriod = 1;
    trend.push({ dayLabel: 'Yesterday', minutes: Math.round(periodTotalMs / 60000) });
  } else if (filter === '7-days') {
    daysInPeriod = 7;
    for (let i = 6; i >= 0; i--) {
      const dayMs = todayStart - i * DAY_MS;
      trend.push({
        dayLabel: dayLabel(dayMs),
        minutes: Math.round((perDayFiltered.get(dayMs) ?? 0) / 60000)
      });
    }
  } else if (filter === '30-days') {
    daysInPeriod = 30;
    // Group 30 days into 6 chunks of 5 days, or just show last 30?
    // Let's just show all 30 days but with date labels (e.g. "12/5")
    for (let i = 29; i >= 0; i--) {
      const dayMs = todayStart - i * DAY_MS;
      const d = new Date(dayMs);
      trend.push({
        dayLabel: `${d.getMonth() + 1}/${d.getDate()}`,
        minutes: Math.round((perDayFiltered.get(dayMs) ?? 0) / 60000)
      });
    }
  } else if (filter === 'all-time') {
    // Group by month
    const perMonth = new Map<string, number>();
    for (const [dayKey, total] of perDayFiltered.entries()) {
      const monthKey = monthLabel(dayKey);
      perMonth.set(monthKey, (perMonth.get(monthKey) ?? 0) + total);
    }
    // Sort months chronologically
    const sortedMonths = Array.from(perDayFiltered.keys())
      .sort((a, b) => a - b)
      .map(k => monthLabel(k));
    
    const uniqueMonths = Array.from(new Set(sortedMonths));
    for (const m of uniqueMonths) {
      trend.push({
        dayLabel: m,
        minutes: Math.round((perMonth.get(m) ?? 0) / 60000)
      });
    }
    daysInPeriod = Math.max(1, perDayAllTime.size);
  }

  // 5. Streaks (calculated globally regardless of filter)
  const sortedDays = Array.from(perDayAllTime.keys()).sort((a, b) => a - b);
  let longestStreakDays = 0;
  let currentRun = 0;
  let previousDay = Number.NaN;
  for (const value of sortedDays) {
    currentRun = Number.isNaN(previousDay) || value - previousDay !== DAY_MS ? 1 : currentRun + 1;
    longestStreakDays = Math.max(longestStreakDays, currentRun);
    previousDay = value;
  }

  let currentStreakDays = 0;
  let cursor = todayStart;
  // If they haven't done anything today, start checking from yesterday
  if (!perDayAllTime.has(cursor)) {
    cursor -= DAY_MS;
  }
  while (perDayAllTime.has(cursor)) {
    currentStreakDays += 1;
    cursor -= DAY_MS;
  }

  // 6. Category breakdown
  const categoryTotals = Array.from(categoryMap.entries())
    .map(([categoryId, totalMs]) => ({ categoryId, totalMs }))
    .sort((a, b) => b.totalMs - a.totalMs);

  return {
    periodTotalMs,
    periodSessions: filteredRecords.length,
    periodDailyAvgMs: periodTotalMs / daysInPeriod,
    currentStreakDays,
    longestStreakDays,
    trend,
    categoryTotals
  };
}
