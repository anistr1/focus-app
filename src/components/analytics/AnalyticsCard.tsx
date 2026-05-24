import { useEffect, useMemo, useState } from "react";
import { buildAnalyticsSummary, type DateRangeFilter } from "../../features/analytics/analytics-summary";
import { usePrefersReducedMotion } from "../../features/accessibility/use-prefers-reduced-motion";
import {
  readSessionHistory,
  SESSION_HISTORY_UPDATED_EVENT,
  type SessionRecord
} from "../../features/sessions/session-history";
import { readCategories, CATEGORIES_UPDATED_EVENT, Category } from "../../features/categories/categories-state";

function formatMinutes(ms: number): string {
  return `${Math.round(ms / 60000)}m`;
}

export function AnalyticsCard() {
  const [records, setRecords] = useState<SessionRecord[]>(() => readSessionHistory());
  const [categories, setCategories] = useState<Category[]>(() => readCategories());
  const [filter, setFilter] = useState<DateRangeFilter>('7-days');
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handler = () => setRecords(readSessionHistory());
    window.addEventListener(SESSION_HISTORY_UPDATED_EVENT, handler);
    return () => window.removeEventListener(SESSION_HISTORY_UPDATED_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = () => setCategories(readCategories());
    window.addEventListener(CATEGORIES_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CATEGORIES_UPDATED_EVENT, handler);
  }, []);

  const summary = useMemo(() => buildAnalyticsSummary(records, filter), [records, filter]);
  const trendMax = Math.max(1, ...summary.trend.map((point) => point.minutes));

  // Build a lookup map for fast category resolving
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  return (
    <div className="flex h-full flex-col pt-2 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Analytics</h2>
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as DateRangeFilter)}
          className="bg-transparent text-xs text-[var(--text-primary)] font-medium outline-none border border-[var(--border-subtle)] rounded-md px-2 py-1 appearance-none hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7-days">Last 7 Days</option>
          <option value="30-days">Last 30 Days</option>
          <option value="all-time">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="glass-panel flex flex-col justify-center rounded-2xl p-4">
          <span className="text-xs text-[var(--text-muted)] mb-1">Total Time</span>
          <span className="text-2xl font-light text-[var(--text-primary)]">{formatMinutes(summary.periodTotalMs)}</span>
        </div>
        <div className="glass-panel flex flex-col justify-center rounded-2xl p-4">
          <span className="text-xs text-[var(--text-muted)] mb-1">Daily Average</span>
          <span className="text-2xl font-light text-[var(--text-primary)]">{formatMinutes(summary.periodDailyAvgMs)}</span>
        </div>
        <div className="glass-panel flex flex-col justify-center rounded-2xl p-4">
          <span className="text-xs text-[var(--text-muted)] mb-1">Sessions</span>
          <span className="text-2xl font-light text-[var(--text-primary)]">{summary.periodSessions}</span>
        </div>
        <div className="glass-panel flex flex-col justify-center rounded-2xl p-4">
          <span className="text-xs text-[var(--text-muted)] mb-1">Current Streak</span>
          <span className="text-2xl font-light text-[var(--text-primary)]">{summary.currentStreakDays} <span className="text-sm">days</span></span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-6">Trend</h3>
        
        <div
          data-testid="weekly-trend-bars"
          className={`analytics-bars h-32 ${reduceMotion ? "motion-reduce" : "motion-safe"} ${
            summary.trend.length > 7 ? "overflow-x-auto overflow-y-hidden snap-x justify-start" : "justify-between"
          }`}
        >
          {summary.trend.map((point) => (
            <div key={point.dayLabel} className="analytics-bar-item h-full justify-end group min-w-[30px] snap-end">
              <div
                className="analytics-bar group-hover:opacity-100"
                style={{ height: `${Math.max(8, Math.round((point.minutes / trendMax) * 100))}%` }}
                aria-label={`${point.dayLabel}: ${point.minutes} minutes`}
              />
              <span className="mt-2 text-[9px] font-medium text-[var(--text-secondary)] whitespace-nowrap">{point.dayLabel}</span>
            </div>
          ))}
        </div>
      </div>

      {summary.categoryTotals.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 mb-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-4">Category Breakdown</h3>
          <div className="flex flex-col gap-3">
            {summary.categoryTotals.map(({ categoryId, totalMs }) => {
              const cat = categoryMap.get(categoryId);
              const name = cat?.name || (categoryId === "uncategorized" ? "Uncategorized" : "Unknown");
              const color = cat?.color || "var(--border-subtle)";
              
              // Find max total to calculate relative bar width
              const maxCatTotal = Math.max(1, summary.categoryTotals[0].totalMs);
              const pct = Math.max(2, Math.round((totalMs / maxCatTotal) * 100));

              return (
                <div key={categoryId} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      {name}
                    </div>
                    <span className="text-[var(--text-primary)] font-medium tabular-nums">{formatMinutes(totalMs)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${pct}%`, backgroundColor: color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-2">
        <p className="text-xs text-[var(--text-muted)] italic">
          Longest streak: {summary.longestStreakDays} days — keep going.
        </p>
      </div>
    </div>
  );
}
