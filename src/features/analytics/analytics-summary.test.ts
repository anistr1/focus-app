import { describe, expect, it } from "vitest";
import { buildAnalyticsSummary } from "./analytics-summary";
import type { SessionRecord } from "../sessions/session-history";

const day = 24 * 60 * 60 * 1000;

function atUtcDay(offset: number, hour = 12): number {
  const base = Date.UTC(2026, 4, 24, hour, 0, 0, 0);
  return base + offset * day;
}

function record(
  id: string,
  durationMin: number,
  dayOffset: number,
  completed = true,
  intention?: string,
  categoryId?: string
): SessionRecord {
  const completedAtMs = atUtcDay(dayOffset);
  return {
    id,
    durationMs: durationMin * 60 * 1000,
    completed,
    completedAtMs,
    completionKey: `${id}-${completedAtMs}`,
    intention,
    categoryId
  };
}

describe("buildAnalyticsSummary", () => {
  it("derives daily, weekly, monthly, streak and completion summaries", () => {
    const sessions = [
      record("a", 25, -2, true, "writing spec", "cat-session"),
      record("b", 30, -1, true, "coding feature", "cat-learn"),
      record("c", 15, 0, true, "writing spec", "cat-session"),
      record("d", 35, 0, false, "writing spec", "cat-session") // uncompleted!
    ];

    const summaryToday = buildAnalyticsSummary(sessions, "today", atUtcDay(0));
    expect(summaryToday.currentStreakDays).toBe(3);
    expect(summaryToday.longestStreakDays).toBe(3);
    expect(summaryToday.periodSessions).toBe(1); // 1 completed session today
    expect(summaryToday.periodTotalMs).toBe(50 * 60 * 1000); // counts all durations (15 + 35)

    const summaryWeek = buildAnalyticsSummary(sessions, "7-days", atUtcDay(0));
    expect(summaryWeek.periodSessions).toBe(3); // 3 completed sessions in week
    expect(summaryWeek.periodTotalMs).toBe(105 * 60 * 1000); // 25 + 30 + 15 + 35
    expect(summaryWeek.trend).toHaveLength(7);
    expect(summaryWeek.trend.at(-1)?.minutes).toBe(50); // Today's total minutes
  });

  it("calculates completionRate, avgSessionMs, and bestFocusWindowHour", () => {
    const sessions = [
      record("1", 30, 0, true, "Task A"), // completed, 30m
      record("2", 15, 0, false, "Task B"), // not completed, 15m
      record("3", 20, 0, true, "Task A") // completed, 20m
    ];

    const summary = buildAnalyticsSummary(sessions, "today", atUtcDay(0));
    expect(summary.completionRate).toBe(67); // 2 completed / 3 total = 66.6% -> 67%
    expect(summary.avgSessionMs).toBe(25 * 60 * 1000); // avg of completed: (30 + 20) / 2 = 25m
  });

  it("groups tasks by category and exact case-insensitive intention", () => {
    const sessions = [
      record("1", 20, 0, true, "Write Code", "cat-learn"),
      record("2", 30, 0, true, "write code", "cat-learn"), // case match
      record("3", 15, 0, true, "Review PR", "cat-learn"),
      record("4", 10, 0, true, undefined, "cat-learn"), // no intention
      record("5", 40, 0, true, "Draw mockup", "cat-session")
    ];

    const summary = buildAnalyticsSummary(sessions, "today", atUtcDay(0));
    
    // Check categories order (cat-learn has 20+30+15+10 = 75m, cat-session has 40m)
    expect(summary.taskBreakdown).toHaveLength(2);
    expect(summary.taskBreakdown[0].categoryId).toBe("cat-learn");
    expect(summary.taskBreakdown[1].categoryId).toBe("cat-session");

    const learnTasks = summary.taskBreakdown[0].tasks;
    expect(learnTasks).toHaveLength(3);
    
    // First task should be "Write Code" (case-insensitive merged, combined 50m, sessionCount = 2)
    expect(learnTasks[0].intention).toBe("Write Code");
    expect(learnTasks[0].totalMs).toBe(50 * 60 * 1000);
    expect(learnTasks[0].sessionCount).toBe(2);

    // Second task should be "Review PR" (15m, sessionCount = 1)
    expect(learnTasks[1].intention).toBe("Review PR");
    expect(learnTasks[1].totalMs).toBe(15 * 60 * 1000);

    // Empty intention should be last
    expect(learnTasks[2].intention).toBe("");
    expect(learnTasks[2].totalMs).toBe(10 * 60 * 1000);
    expect(learnTasks[2].sessionCount).toBe(1);
  });

  it("groups 30-day filters into exactly 5 weekly buckets (W1-W5)", () => {
    const sessions = [
      record("1", 10, -28), // W1
      record("2", 20, -20), // W2
      record("3", 30, -14), // W3
      record("4", 40, -8),  // W4
      record("5", 50, -1)   // W5
    ];

    const summary = buildAnalyticsSummary(sessions, "30-days", atUtcDay(0));
    expect(summary.trend).toHaveLength(5);
    expect(summary.trend[0].dayLabel).toBe("W1");
    expect(summary.trend[0].minutes).toBe(10);
    expect(summary.trend[1].dayLabel).toBe("W2");
    expect(summary.trend[1].minutes).toBe(20);
    expect(summary.trend[2].dayLabel).toBe("W3");
    expect(summary.trend[2].minutes).toBe(30);
    expect(summary.trend[3].dayLabel).toBe("W4");
    expect(summary.trend[3].minutes).toBe(40);
    expect(summary.trend[4].dayLabel).toBe("W5");
    expect(summary.trend[4].minutes).toBe(50);
  });

  it("returns calm defaults for empty history", () => {
    const summary = buildAnalyticsSummary([], "7-days", atUtcDay(0));
    expect(summary.currentStreakDays).toBe(0);
    expect(summary.longestStreakDays).toBe(0);
    expect(summary.periodTotalMs).toBe(0);
    expect(summary.trend).toHaveLength(7);
    expect(summary.taskBreakdown).toHaveLength(0);
    expect(summary.completionRate).toBe(0);
    expect(summary.bestFocusWindowHour).toBeNull();
    expect(summary.avgSessionMs).toBe(0);
  });
});

