import type { SessionRecord } from "../sessions/session-history";

export type DateRangeFilter = 'today' | 'yesterday' | '7-days' | '30-days' | 'all-time';

export type AnalyticsPoint = {
  dayLabel: string;
  minutes: number;
  categories?: { categoryId: string; minutes: number }[];
  dayStartMs?: number;
};

export type TaskBreakdownItem = {
  intention: string;
  totalMs: number;
  sessionCount: number;
};

export type CategoryBreakdownItem = {
  categoryId: string;
  totalMs: number;
  tasks: TaskBreakdownItem[];
};

export type AnalyticsSummary = {
  periodTotalMs: number;
  periodSessions: number;
  periodDailyAvgMs: number;
  currentStreakDays: number;
  longestStreakDays: number;
  trend: AnalyticsPoint[];
  categoryTotals: { categoryId: string; totalMs: number }[];
  taskBreakdown: CategoryBreakdownItem[];
  completionRate: number;
  bestFocusWindowHour: number | null;
  avgSessionMs: number;
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

  const periodRecords = records.filter(r =>
    r.completedAtMs >= minTimeMs && r.completedAtMs <= maxTimeMs
  );

  const completedPeriodRecords = periodRecords.filter(r => r.completed);

  // 3. Compute basic stats
  let periodTotalMs = 0;
  const categoryMap = new Map<string, number>();
  const perDayAllTime = new Map<number, number>(); // Needed for streaks
  const perDayFiltered = new Map<number, number>();
  
  for (const record of records) {
    // Process all records (completed and partial)
    
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

  // Helper to get category breakdown for days list
  const getCategoryBreakdownForDays = (dayMsList: number[]): { categoryId: string; minutes: number }[] => {
    const catMinutes = new Map<string, number>();
    for (const record of records) {
      const dayKey = dayStart(record.completedAtMs);
      if (dayMsList.includes(dayKey)) {
        const catId = record.categoryId || "uncategorized";
        catMinutes.set(catId, (catMinutes.get(catId) ?? 0) + record.durationMs);
      }
    }
    return Array.from(catMinutes.entries())
      .map(([categoryId, ms]) => ({ categoryId, minutes: Math.round(ms / 60000) }))
      .filter(item => item.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
  };

  // 4. Calculate trend
  const trend: AnalyticsPoint[] = [];
  let daysInPeriod = 1;

  if (filter === 'today') {
    daysInPeriod = 1;
    trend.push({ 
      dayLabel: 'Today', 
      minutes: Math.round(periodTotalMs / 60000),
      dayStartMs: todayStart,
      categories: getCategoryBreakdownForDays([todayStart])
    });
  } else if (filter === 'yesterday') {
    daysInPeriod = 1;
    trend.push({ 
      dayLabel: 'Yesterday', 
      minutes: Math.round(periodTotalMs / 60000),
      dayStartMs: todayStart - DAY_MS,
      categories: getCategoryBreakdownForDays([todayStart - DAY_MS])
    });
  } else if (filter === '7-days') {
    daysInPeriod = 7;
    for (let i = 6; i >= 0; i--) {
      const dayMs = todayStart - i * DAY_MS;
      trend.push({
        dayLabel: dayLabel(dayMs),
        minutes: Math.round((perDayFiltered.get(dayMs) ?? 0) / 60000),
        dayStartMs: dayMs,
        categories: getCategoryBreakdownForDays([dayMs])
      });
    }
  } else if (filter === '30-days') {
    daysInPeriod = 30;
    // Chronological: 5 weekly buckets (W1 is oldest, W5 is newest)
    for (let w = 0; w < 5; w++) {
      let weekTotalMs = 0;
      const startDayIdx = 29 - w * 6;
      const dayMsList: number[] = [];
      for (let d = 0; d < 6; d++) {
        const dayOffset = startDayIdx - d;
        const dayMs = todayStart - dayOffset * DAY_MS;
        dayMsList.push(dayMs);
        weekTotalMs += perDayFiltered.get(dayMs) ?? 0;
      }
      trend.push({
        dayLabel: `W${w + 1}`,
        minutes: Math.round(weekTotalMs / 60000),
        dayStartMs: dayMsList[5], // oldest day in this week is at index 5
        categories: getCategoryBreakdownForDays(dayMsList)
      });
    }
  } else if (filter === 'all-time') {
    // Group by month
    const perMonth = new Map<string, number>();
    const monthDayKeys = new Map<string, number[]>();
    for (const [dayKey, total] of perDayFiltered.entries()) {
      const monthKey = monthLabel(dayKey);
      perMonth.set(monthKey, (perMonth.get(monthKey) ?? 0) + total);
      if (!monthDayKeys.has(monthKey)) {
        monthDayKeys.set(monthKey, []);
      }
      monthDayKeys.get(monthKey)!.push(dayKey);
    }
    // Sort months chronologically
    const sortedDays = Array.from(perDayFiltered.keys()).sort((a, b) => a - b);
    const sortedMonths = sortedDays.map(k => monthLabel(k));
    
    const uniqueMonths = Array.from(new Set(sortedMonths));
    for (const m of uniqueMonths) {
      const dayMsList = monthDayKeys.get(m) || [];
      const repDayMs = dayMsList[0] || 0;
      trend.push({
        dayLabel: m,
        minutes: Math.round((perMonth.get(m) ?? 0) / 60000),
        dayStartMs: repDayMs,
        categories: getCategoryBreakdownForDays(dayMsList)
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

  // 7. taskBreakdown
  const taskMap = new Map<string, Map<string, { totalMs: number; count: number; displayName: string }>>();
  for (const r of periodRecords) {
    const catId = r.categoryId || "uncategorized";
    const rawIntention = (r.intention || "").trim();
    const groupKey = rawIntention.toLowerCase();
    
    if (!taskMap.has(catId)) {
      taskMap.set(catId, new Map());
    }
    const catTasks = taskMap.get(catId)!;
    if (!catTasks.has(groupKey)) {
      catTasks.set(groupKey, { totalMs: 0, count: 0, displayName: rawIntention });
    }
    const data = catTasks.get(groupKey)!;
    data.totalMs += r.durationMs;
    data.count += 1;
  }

  const taskBreakdown: CategoryBreakdownItem[] = Array.from(taskMap.entries()).map(([catId, catTasks]) => {
    const tasks = Array.from(catTasks.entries()).map(([_, data]) => ({
      intention: data.displayName,
      totalMs: data.totalMs,
      sessionCount: data.count
    })).sort((a, b) => {
      // Put empty intention at the bottom
      if (a.intention === "" && b.intention !== "") return 1;
      if (a.intention !== "" && b.intention === "") return -1;
      return b.totalMs - a.totalMs;
    });

    const totalMs = tasks.reduce((sum, t) => sum + t.totalMs, 0);
    return {
      categoryId: catId,
      totalMs,
      tasks
    };
  }).sort((a, b) => b.totalMs - a.totalMs);

  // 8. completionRate
  const completionRate = periodRecords.length === 0 ? 0 : Math.round((completedPeriodRecords.length / periodRecords.length) * 100);

  // 9. avgSessionMs
  const avgSessionMs = completedPeriodRecords.length === 0 ? 0 : Math.round(completedPeriodRecords.reduce((sum, r) => sum + r.durationMs, 0) / completedPeriodRecords.length);

  // 10. bestFocusWindowHour
  const hourSumMs = new Array(24).fill(0);
  for (const r of periodRecords) {
    const startMs = r.completedAtMs - r.durationMs;
    const hour = new Date(startMs).getHours();
    hourSumMs[hour] += r.durationMs;
  }
  let bestFocusWindowHour: number | null = null;
  let maxDuration = 0;
  for (let h = 0; h < 24; h++) {
    if (hourSumMs[h] > maxDuration) {
      maxDuration = hourSumMs[h];
      bestFocusWindowHour = h;
    }
  }

  return {
    periodTotalMs,
    periodSessions: filteredRecords.length,
    periodDailyAvgMs: periodTotalMs / daysInPeriod,
    currentStreakDays,
    longestStreakDays,
    trend,
    categoryTotals,
    taskBreakdown,
    completionRate,
    bestFocusWindowHour,
    avgSessionMs
  };
}

