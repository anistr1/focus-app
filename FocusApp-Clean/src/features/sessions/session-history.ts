export const COMPLETED_SESSIONS_KEY = "focus-app:completed-sessions";
export const SESSION_HISTORY_UPDATED_EVENT = "focus-app:sessions-updated";

export type SessionRecord = {
  id: string;
  durationMs: number;
  completed: boolean;
  completedAtMs: number;
  completionKey: string;
};

export type SessionHistorySummary = {
  completedSessions: number;
  totalFocusMs: number;
  averageSessionMs: number;
};

export function createSessionRecord(input: {
  durationMs: number;
  completedAtMs: number;
  completionKey: string;
}): SessionRecord {
  return {
    id: `${input.completionKey}-${input.completedAtMs}`,
    durationMs: input.durationMs,
    completed: true,
    completedAtMs: input.completedAtMs,
    completionKey: input.completionKey
  };
}

export function readSessionHistory(): SessionRecord[] {
  try {
    const raw = window.localStorage.getItem(COMPLETED_SESSIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SessionRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.durationMs === "number" &&
        typeof item.completed === "boolean" &&
        typeof item.completedAtMs === "number" &&
        typeof item.completionKey === "string"
    );
  } catch {
    return [];
  }
}

function writeSessionHistory(records: SessionRecord[]): void {
  window.localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(SESSION_HISTORY_UPDATED_EVENT));
}

export function recordCompletedSession(record: SessionRecord): void {
  const history = readSessionHistory();
  const duplicate = history.some((entry) => entry.completionKey === record.completionKey);
  if (duplicate) {
    return;
  }
  const updated = [record, ...history].slice(0, 100);
  writeSessionHistory(updated);
}

export function getSessionHistorySummary(records: SessionRecord[]): SessionHistorySummary {
  const completed = records.filter((entry) => entry.completed);
  const completedSessions = completed.length;
  const totalFocusMs = completed.reduce((sum, entry) => sum + entry.durationMs, 0);
  const averageSessionMs = completedSessions === 0 ? 0 : Math.round(totalFocusMs / completedSessions);
  return { completedSessions, totalFocusMs, averageSessionMs };
}
