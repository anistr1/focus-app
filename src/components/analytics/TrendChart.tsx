import { useState, useMemo } from "react";
import { AnalyticsPoint } from "../../features/analytics/analytics-summary";
import { Category } from "../../features/categories/categories-state";
import { usePrefersReducedMotion } from "../../features/accessibility/use-prefers-reduced-motion";

type TrendChartProps = {
  trend: AnalyticsPoint[];
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  drillDownDateMs: number | null;
  onSelectDrillDownDate: (dateMs: number | null) => void;
};

export function TrendChart({
  trend,
  categories,
  selectedCategoryId,
  onSelectCategory,
  drillDownDateMs,
  onSelectDrillDownDate
}: TrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<AnalyticsPoint | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  // Maximum value for scaling the bars
  const maxMinutes = useMemo(() => {
    return Math.max(1, ...trend.map((p) => p.minutes));
  }, [trend]);

  // Build a fast lookup for categories
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Get color for category
  const getCategoryColor = (catId: string) => {
    if (catId === "uncategorized") return "var(--text-muted)";
    return categoryMap.get(catId)?.color || "var(--border-subtle)";
  };

  // Toggle drilldown for a day/week bar
  const handleBarClick = (point: AnalyticsPoint) => {
    if (point.dayStartMs === undefined) return;
    if (drillDownDateMs === point.dayStartMs) {
      onSelectDrillDownDate(null); // Deselect
    } else {
      onSelectDrillDownDate(point.dayStartMs);
    }
  };

  // Toggle segment click (drills down to that day AND category)
  const handleSegmentClick = (e: React.MouseEvent, point: AnalyticsPoint, catId: string) => {
    e.stopPropagation(); // Stop click from bubling to the bar
    if (point.dayStartMs === undefined) return;

    if (drillDownDateMs === point.dayStartMs && selectedCategoryId === catId) {
      // If already active, clear both
      onSelectDrillDownDate(null);
      onSelectCategory(null);
    } else {
      onSelectDrillDownDate(point.dayStartMs);
      onSelectCategory(catId);
    }
  };

  // Render detail text in trend header
  const detailText = useMemo(() => {
    if (hoveredPoint) {
      if (hoveredPoint.minutes === 0) {
        return `${hoveredPoint.dayLabel}: 0m`;
      }
      
      const breakdown = (hoveredPoint.categories || [])
        .map((cat) => {
          const cName = categoryMap.get(cat.categoryId)?.name || 
            (cat.categoryId === "uncategorized" ? "Uncategorized" : "Unknown");
          return `${cat.minutes}m ${cName}`;
        })
        .join(", ");
      
      return `${hoveredPoint.dayLabel}: ${hoveredPoint.minutes}m ${breakdown ? `(${breakdown})` : ""}`;
    }

    if (drillDownDateMs !== null) {
      const activeBar = trend.find((p) => p.dayStartMs === drillDownDateMs);
      if (activeBar) {
        return `Showing ${activeBar.dayLabel} only · Click to reset`;
      }
    }

    return "Focus distribution · Hover to scan";
  }, [hoveredPoint, drillDownDateMs, trend, categoryMap]);

  return (
    <div className="glass-panel rounded-xl p-3 mb-3 flex flex-col shrink-0" style={{ height: "126px" }}>
      {/* Chart Header Row */}
      <div className="flex justify-between items-center mb-2 shrink-0">
        <span className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider truncate max-w-[340px]">
          {detailText}
        </span>
        <span className="text-[9px] text-[var(--text-muted)] font-mono shrink-0">
          max: {maxMinutes}m
        </span>
      </div>

      {/* Chart Bars Area */}
      <div
        data-testid="weekly-trend-bars"
        className={`flex-1 flex items-end justify-between gap-1.5 h-full relative px-1 ${
          reduceMotion ? "motion-reduce" : "motion-safe"
        }`}
      >
        {trend.map((point, idx) => {
          const isDrilledDown = drillDownDateMs === point.dayStartMs;
          const barHeightPct = Math.min(100, Math.max(0, (point.minutes / maxMinutes) * 100));
          const hasData = point.minutes > 0;

          // Normalize point categories to ensure everything matches
          const cats = point.categories || [];

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full group cursor-pointer justify-end"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => handleBarClick(point)}
            >
              {/* Vertical Stack Bar */}
              <div className="w-full flex-1 flex flex-col justify-end min-h-0 relative">
                {hasData ? (
                  <div
                    className={`stacked-bar-container ${
                      isDrilledDown ? "outline outline-2 outline-[var(--accent)] outline-offset-1" : ""
                    } ${
                      drillDownDateMs !== null && !isDrilledDown ? "opacity-40" : "opacity-90 hover:opacity-100"
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  >
                    {/* Render stacked segments (reversed so bottom-up stack matches chronological category additions) */}
                    {cats.map((cat) => {
                      const segmentHeightPct = (cat.minutes / point.minutes) * 100;
                      const isCatDimmed = selectedCategoryId !== null && selectedCategoryId !== cat.categoryId;
                      const segmentColor = getCategoryColor(cat.categoryId);

                      return (
                        <div
                          key={cat.categoryId}
                          className="stacked-bar-segment transition-all"
                          onClick={(e) => handleSegmentClick(e, point, cat.categoryId)}
                          style={{
                            height: `${segmentHeightPct}%`,
                            backgroundColor: segmentColor,
                            opacity: isCatDimmed ? 0.2 : 1.0
                          }}
                          title={`${cat.minutes}m in category`}
                        />
                      );
                    })}
                  </div>
                ) : (
                  // Tiny baseline placeholder for empty days
                  <div
                    className="w-full rounded-full bg-[var(--border-subtle)] opacity-20"
                    style={{ height: "2px" }}
                  />
                )}
              </div>

              {/* Day/Week Label */}
              <span className={`mt-1 text-[9px] font-medium leading-none shrink-0 tabular-nums ${
                isDrilledDown ? "text-[var(--accent)] font-bold" : "text-[var(--text-muted)]"
              }`}>
                {point.dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
