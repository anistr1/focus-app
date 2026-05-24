import { describe, expect, it } from "vitest";
import {
  createSessionRecord,
  getSessionHistorySummary,
  readSessionHistory,
  recordCompletedSession
} from "./session-history";

describe("session history", () => {
  it("records completed local session records", () => {
    window.localStorage.clear();
    const record = createSessionRecord({
      durationMs: 25 * 60 * 1000,
      completedAtMs: 1000,
      completionKey: "focus-1"
    });
    recordCompletedSession(record);

    const entries = readSessionHistory();
    expect(entries).toHaveLength(1);
    expect(entries[0].durationMs).toBe(25 * 60 * 1000);
  });

  it("avoids duplicate writes for the same completion key", () => {
    window.localStorage.clear();
    const record = createSessionRecord({
      durationMs: 25 * 60 * 1000,
      completedAtMs: 1000,
      completionKey: "focus-duplicate"
    });
    recordCompletedSession(record);
    recordCompletedSession(record);

    expect(readSessionHistory()).toHaveLength(1);
  });

  it("computes history summary totals and averages", () => {
    window.localStorage.clear();
    recordCompletedSession(
      createSessionRecord({ durationMs: 1_500_000, completedAtMs: 10_000, completionKey: "a" })
    );
    recordCompletedSession(
      createSessionRecord({ durationMs: 900_000, completedAtMs: 20_000, completionKey: "b" })
    );

    const summary = getSessionHistorySummary(readSessionHistory());
    expect(summary.completedSessions).toBe(2);
    expect(summary.totalFocusMs).toBe(2_400_000);
    expect(summary.averageSessionMs).toBe(1_200_000);
  });
});
