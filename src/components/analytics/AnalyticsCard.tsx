import { useEffect, useMemo, useState } from "react";
import { buildAnalyticsSummary, type DateRangeFilter } from "../../features/analytics/analytics-summary";
import {
  readSessionHistory,
  SESSION_HISTORY_UPDATED_EVENT,
  type SessionRecord
} from "../../features/sessions/session-history";
import { readCategories, CATEGORIES_UPDATED_EVENT, Category } from "../../features/categories/categories-state";
import { KpiStrip } from "./KpiStrip";
import { TrendChart } from "./TrendChart";
import { CategoryAccordion } from "./CategoryAccordion";
import { QualityFooter } from "./QualityFooter";

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function dayStart(timestampMs: number): number {
  const date = new Date(timestampMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function AnalyticsCard() {
  const [records, setRecords] = useState<SessionRecord[]>(() => readSessionHistory());
  const [categories, setCategories] = useState<Category[]>(() => readCategories());
  const [filter, setFilter] = useState<DateRangeFilter>('7-days');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [drillDownDateMs, setDrillDownDateMs] = useState<number | null>(null);

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

  // 1. Build general period summary (unfiltered by drillDown)
  const summary = useMemo(() => buildAnalyticsSummary(records, filter), [records, filter]);

  // 2. Filter records dynamically for the Category Breakdown Accordion when tapping a trend bar
  const filteredRecordsForAccordion = useMemo(() => {
    if (drillDownDateMs === null) {
      return records;
    }

    if (filter === '30-days') {
      const DAY_MS = 24 * 60 * 60 * 1000;
      return records.filter((r) => {
        const dayKey = dayStart(r.completedAtMs);
        return dayKey >= drillDownDateMs && dayKey < drillDownDateMs + 6 * DAY_MS;
      });
    } else if (filter === 'all-time') {
      const targetDate = new Date(drillDownDateMs);
      return records.filter((r) => {
        const d = new Date(r.completedAtMs);
        return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
      });
    } else {
      return records.filter((r) => dayStart(r.completedAtMs) === drillDownDateMs);
    }
  }, [records, drillDownDateMs, filter]);

  // 3. Build drill-down summary for accordion
  const drillDownSummary = useMemo(() => {
    return buildAnalyticsSummary(filteredRecordsForAccordion, filter, drillDownDateMs || Date.now());
  }, [filteredRecordsForAccordion, filter, drillDownDateMs]);

  // Handle active category selection
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  return (
    <div
      className="flex flex-col select-none overflow-hidden w-full pt-1 pb-4"
      style={{ height: "540px" }}
    >
      {/* Header + Filter Bar (40px height budget) */}
      <div className="flex items-center justify-between mb-3 shrink-0" style={{ height: "40px" }}>
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Analytics
        </h2>
        
        <div className="flex gap-2">
          {/* Category Dropdown Pill */}
          <div 
            className="glass-panel relative rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] font-semibold transition-all cursor-pointer flex items-center"
            style={{ 
              borderColor: selectedCategoryId ? activeCategory?.color : "var(--border-subtle)",
              boxShadow: selectedCategoryId ? `0 0 6px ${activeCategory?.color}30` : "none"
            }}
          >
            <select
              value={selectedCategoryId || ""}
              onChange={(e) => setSelectedCategoryId(e.target.value || null)}
              className="bg-transparent pr-4 outline-none border-none cursor-pointer text-[11px] font-semibold appearance-none text-left"
              style={{ color: selectedCategoryId && activeCategory ? activeCategory.color : "var(--text-primary)" }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={{ color: c.color }}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-[8px] absolute right-2.5 pointer-events-none text-[var(--text-muted)] font-bold">▼</span>
          </div>

          {/* Date Range Dropdown Pill */}
          <div 
            className="glass-panel relative rounded-lg px-2.5 py-1 text-xs text-[var(--text-primary)] font-semibold transition-all cursor-pointer flex items-center"
            style={{ 
              borderColor: filter !== "7-days" ? "var(--accent)" : "var(--border-subtle)",
              boxShadow: filter !== "7-days" ? "0 0 6px var(--accent-glow)" : "none"
            }}
          >
            <select 
              value={filter} 
              onChange={(e) => {
                setFilter(e.target.value as DateRangeFilter);
                setDrillDownDateMs(null); // Clear drill down when range changes
              }}
              className="bg-transparent pr-4 outline-none border-none cursor-pointer text-[11px] font-semibold appearance-none text-left"
              style={{ color: filter !== "7-days" ? "var(--accent-bright)" : "var(--text-primary)" }}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7-days">Last 7 Days</option>
              <option value="30-days">Last 30 Days</option>
              <option value="all-time">All Time</option>
            </select>
            <span className="text-[8px] absolute right-2.5 pointer-events-none text-[var(--text-muted)] font-bold">▼</span>
          </div>
        </div>
      </div>

      {/* KPI Strip (64px height budget) */}
      <KpiStrip
        totalMs={summary.periodTotalMs}
        sessionsCount={summary.periodSessions}
        completionRate={summary.completionRate}
        streakDays={summary.currentStreakDays}
      />

      {/* Stacked Trend Chart (126px height budget, fits within 110px budget + margins) */}
      <TrendChart
        trend={summary.trend}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        drillDownDateMs={drillDownDateMs}
        onSelectDrillDownDate={setDrillDownDateMs}
      />

      {/* Category Accordion (290px height budget, internally scrollable) */}
      <CategoryAccordion
        taskBreakdown={drillDownSummary.taskBreakdown}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Quality Footer Strip (36px height budget) */}
      <QualityFooter
        bestFocusWindowHour={summary.bestFocusWindowHour}
        avgSessionMs={summary.avgSessionMs}
        completionRate={summary.completionRate}
      />
    </div>
  );
}
