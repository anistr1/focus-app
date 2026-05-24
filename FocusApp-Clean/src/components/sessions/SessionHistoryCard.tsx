import { useEffect, useState } from "react";
import {
  getSessionHistorySummary,
  readSessionHistory,
  SESSION_HISTORY_UPDATED_EVENT,
  type SessionRecord
} from "../../features/sessions/session-history";

function formatMinutes(durationMs: number): string {
  return `${Math.round(durationMs / 60000)} min`;
}

function formatDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleString();
}

export function SessionHistoryCard() {
  const [records, setRecords] = useState<SessionRecord[]>(() => readSessionHistory());

  useEffect(() => {
    const handler = () => setRecords(readSessionHistory());
    window.addEventListener(SESSION_HISTORY_UPDATED_EVENT, handler);
    return () => window.removeEventListener(SESSION_HISTORY_UPDATED_EVENT, handler);
  }, []);

  const summary = getSessionHistorySummary(records);
  const recent = records.slice(0, 5);

  return (
    <article className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Session History</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">Recent focus sessions</h2>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-[var(--text-secondary)]">Total focus</p>
          <p className="font-medium">{formatMinutes(summary.totalFocusMs)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-[var(--text-secondary)]">Completed</p>
          <p className="font-medium">{summary.completedSessions}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2">
          <p className="text-[var(--text-secondary)]">Average</p>
          <p className="font-medium">{formatMinutes(summary.averageSessionMs)}</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="mt-5 text-sm text-[var(--text-secondary)]">
          Your completed sessions will appear here as you build your rhythm.
        </p>
      ) : (
        <ul className="mt-5 space-y-2 text-sm">
          {recent.map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2"
            >
              <p className="font-medium">{formatMinutes(entry.durationMs)} completed</p>
              <p className="text-xs text-[var(--text-secondary)]">{formatDate(entry.completedAtMs)}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
