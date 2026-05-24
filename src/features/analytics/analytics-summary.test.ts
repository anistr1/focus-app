import { describe, expect, it } from "vitest";
import { buildAnalyticsSummary } from "./analytics-summary";
import type { SessionRecord } from "../sessions/session-history";

const day = 24 * 60 * 60 * 1000;

function atUtcDay(offset: number, hour = 12): number {
  const base = Date.UTC(2026, 4, 24, hour, 0, 0, 0);
  return base + offset * day;
}

function record(id: string, durationMin: number, dayOffset: number): SessionRecord {
  const completedAtMs = atUtcDay(dayOffset);
  return {
    id,
    durationMs: durationMin * 60 * 1000,
    completed: true,
    completedAtMs,
    completionKey: `${id}-${completedAtMs}`
  };
}

describe("buildAnalyticsSummary", () => {
  it("derives daily, weekly, monthly, streak and completion summaries", () => {
    const sessions = [
      record("a", 25, -2),
      record("b", 30, -1),
      record("c", 15, 0),
      record("d", 35, 0)
    ];

    const summaryToday = buildAnalyticsSummary(sessions, "today", atUtcDay(0));
    expect(summaryToday.currentStreakDays).toBe(3);
    expect(summaryToday.longestStreakDays).toBe(3);
    expect(summaryToday.periodSessions).toBe(2);
    expect(summaryToday.periodTotalMs).toBe(50 * 60 * 1000);

    const summaryWeek = buildAnalyticsSummary(sessions, "7-days", atUtcDay(0));
    expect(summaryWeek.periodSessions).toBe(4);
    expect(summaryWeek.periodTotalMs).toBe(105 * 60 * 1000);
    expect(summaryWeek.trend).toHaveLength(7);
    expect(summaryWeek.trend.at(-1)?.minutes).toBe(50);
  });

  it("returns calm defaults for empty history", () => {
    const summary = buildAnalyticsSummary([], "7-days", atUtcDay(0));
    expect(summary.currentStreakDays).toBe(0);
    expect(summary.longestStreakDays).toBe(0);
    expect(summary.periodTotalMs).toBe(0);
    expect(summary.trend).toHaveLength(7);
  });
});
