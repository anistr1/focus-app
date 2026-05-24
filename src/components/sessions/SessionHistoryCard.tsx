import { useEffect, useState, useMemo } from "react";
import {
  getSessionHistorySummary,
  readSessionHistory,
  SESSION_HISTORY_UPDATED_EVENT,
  type SessionRecord
} from "../../features/sessions/session-history";
import {
  readCategories,
  CATEGORIES_UPDATED_EVENT,
  type Category
} from "../../features/categories/categories-state";

function formatMinutes(durationMs: number): string {
  return `${Math.round(durationMs / 60000)}m`;
}

function formatTime(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function SessionHistoryCard() {
  const [records, setRecords] = useState<SessionRecord[]>(() => readSessionHistory());
  const [categories, setCategories] = useState<Category[]>(() => readCategories());

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

  const summary = getSessionHistorySummary(records);
  const recent = records.slice(0, 10);
  
  const categoryMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  return (
    <div className="flex h-full flex-col pt-2 pb-8">
      <div className="mb-6 flex justify-center">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">History</h2>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3 text-center">
        <div className="glass-panel flex flex-col rounded-2xl p-3">
          <span className="text-xs text-[var(--text-muted)] mb-1">Total</span>
          <span className="text-xl font-light text-[var(--text-primary)]">{formatMinutes(summary.totalFocusMs)}</span>
        </div>
        <div className="glass-panel flex flex-col rounded-2xl p-3">
          <span className="text-xs text-[var(--text-muted)] mb-1">Sessions</span>
          <span className="text-xl font-light text-[var(--text-primary)]">{summary.completedSessions}</span>
        </div>
        <div className="glass-panel flex flex-col rounded-2xl p-3">
          <span className="text-xs text-[var(--text-muted)] mb-1">Avg</span>
          <span className="text-xl font-light text-[var(--text-primary)]">{formatMinutes(summary.averageSessionMs)}</span>
        </div>
      </div>

      {recent.length > 0 && (
        <p className="mb-6 text-center text-[15px] text-[var(--text-secondary)] italic">
          "You've been showing up."
        </p>
      )}

      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center opacity-60">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <p className="text-[15px] text-[var(--text-secondary)]">No sessions yet</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Your history will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {recent.map((entry) => {
            const cat = entry.categoryId ? categoryMap.get(entry.categoryId) : undefined;
            const dotColor = cat ? cat.color : "var(--accent)";
            
            return (
              <li
                key={entry.id}
                className="relative pl-6 after:absolute after:left-[11px] after:top-7 after:-bottom-5 after:w-[1px] after:bg-[var(--border-subtle)] last:after:hidden"
              >
                <span className="absolute left-2 top-3 h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
                <div className="glass-panel rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {entry.intention || "Focus session"}
                      {!entry.completed && (
                        <span className="ml-2 text-xs font-normal text-[var(--text-muted)] italic">(Stopped early)</span>
                      )}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{formatMinutes(entry.durationMs)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <span>{formatDate(entry.completedAtMs)}</span>
                      {cat && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]"></span>
                          <span style={{ color: cat.color }} className="opacity-80">{cat.name}</span>
                        </>
                      )}
                    </div>
                    <span>{formatTime(entry.completedAtMs)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
