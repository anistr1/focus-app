import { useEffect, useMemo, useState } from "react";
import { buildAnalyticsSummary } from "../../features/analytics/analytics-summary";
import { usePrefersReducedMotion } from "../../features/accessibility/use-prefers-reduced-motion";
import {
  readSessionHistory,
  SESSION_HISTORY_UPDATED_EVENT,
  type SessionRecord
} from "../../features/sessions/session-history";

function formatMinutes(ms: number): string {
  return `${Math.round(ms / 60000)} min`;
}

export function AnalyticsCard() {
  const [records, setRecords] = useState<SessionRecord[]>(() => readSessionHistory());
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handler = () => setRecords(readSessionHistory());
    window.addEventListener(SESSION_HISTORY_UPDATED_EVENT, handler);
    return () => window.removeEventListener(SESSION_HISTORY_UPDATED_EVENT, handler);
  }, []);

  const summary = useMemo(() => buildAnalyticsSummary(records), [records]);
  const trendMax = Math.max(1, ...summary.weeklyTrend.map((point) => point.minutes));

  return (
    <article className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Analytics</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">Calm analytics</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Reflect on your rhythm with supportive local insights.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-[var(--text-secondary)]">Today</p>
          <p className="font-medium">{formatMinutes(summary.todayTotalMs)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-[var(--text-secondary)]">This month</p>
          <p className="font-medium">{formatMinutes(summary.monthTotalMs)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-[var(--text-secondary)]">Streak</p>
          <p className="font-medium">{summary.currentStreakDays} days</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-[var(--text-secondary)]">Completed</p>
          <p className="font-medium">{summary.totalCompletedSessions} sessions</p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-medium">Weekly rhythm</h3>
        <div
          data-testid="weekly-trend-bars"
          className={`analytics-bars mt-3 ${reduceMotion ? "motion-reduce" : "motion-safe"}`}
        >
          {summary.weeklyTrend.map((point) => (
            <div key={point.dayLabel} className="analytics-bar-item">
              <div
                className="analytics-bar"
                style={{ height: `${Math.max(10, Math.round((point.minutes / trendMax) * 72))}px` }}
                aria-label={`${point.dayLabel}: ${point.minutes} minutes`}
              />
              <span className="text-[11px] text-[var(--text-secondary)]">{point.dayLabel}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          Longest streak: {summary.longestStreakDays} days.
        </p>
      </div>
    </article>
  );
}
