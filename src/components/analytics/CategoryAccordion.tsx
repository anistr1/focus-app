import { useState, useMemo, useEffect } from "react";
import { Category } from "../../features/categories/categories-state";
import { CategoryBreakdownItem } from "../../features/analytics/analytics-summary";
import { formatDuration } from "./AnalyticsCard";

type CategoryAccordionProps = {
  taskBreakdown: CategoryBreakdownItem[];
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
};

export function CategoryAccordion({
  taskBreakdown,
  categories,
  selectedCategoryId,
  onSelectCategory
}: CategoryAccordionProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Auto-expand category if selected from dropdown filter
  useEffect(() => {
    if (selectedCategoryId) {
      setExpanded((prev) => ({ ...prev, [selectedCategoryId]: true }));
    }
  }, [selectedCategoryId]);

  const allExpanded = useMemo(() => {
    if (taskBreakdown.length === 0) return false;
    return taskBreakdown.every((item) => expanded[item.categoryId]);
  }, [taskBreakdown, expanded]);

  const toggleAll = () => {
    if (allExpanded) {
      setExpanded({});
    } else {
      const next: Record<string, boolean> = {};
      for (const item of taskBreakdown) {
        next[item.categoryId] = true;
      }
      setExpanded(next);
    }
  };

  const maxCategoryMs = useMemo(() => {
    if (taskBreakdown.length === 0) return 1;
    return Math.max(...taskBreakdown.map((item) => item.totalMs));
  }, [taskBreakdown]);

  const toggleCategory = (categoryId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden mb-2">
      {/* Accordion Section Header */}
      <div className="flex items-center justify-between py-1.5 shrink-0 border-b border-[var(--border-subtle)] mb-2">
        <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
          Categories
        </span>
        {taskBreakdown.length > 0 && (
          <button
            onClick={toggleAll}
            className="text-[10px] text-[var(--accent)] font-semibold hover:text-[var(--accent-bright)] transition-colors uppercase tracking-wider"
          >
            {allExpanded ? "collapse all" : "expand all"}
          </button>
        )}
      </div>

      {/* Accordion Scroll Container */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 min-h-0" style={{ maxHeight: "250px" }}>
        {taskBreakdown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="text-xs text-[var(--text-muted)] italic">
              No sessions recorded in this period.
            </span>
          </div>
        ) : (
          taskBreakdown.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            const name = cat?.name || (item.categoryId === "uncategorized" ? "Uncategorized" : "Unknown");
            const color = cat?.color || "var(--border-subtle)";
            const pct = Math.max(2, Math.round((item.totalMs / maxCategoryMs) * 100));
            const isExpanded = !!expanded[item.categoryId];
            const isFilterSelected = selectedCategoryId === item.categoryId;

            return (
              <div
                key={item.categoryId}
                className={`flex flex-col rounded-xl overflow-hidden transition-colors ${
                  isFilterSelected ? "bg-[var(--bg-elevated)]/30 border border-[var(--accent-soft)]" : ""
                }`}
              >
                {/* Category Main Row */}
                <div
                  onClick={() => toggleCategory(item.categoryId)}
                  className="flex items-center justify-between py-2 px-3 hover:bg-[var(--bg-elevated)]/50 rounded-xl cursor-pointer transition-colors group select-none"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-4">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[100px]">
                      {name}
                    </span>
                    {/* Relative horizontal progress bar */}
                    <div className="h-1.5 flex-1 bg-[var(--bg-elevated)]/40 rounded-full overflow-hidden hidden xs:block">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[var(--text-secondary)] font-medium tabular-nums">
                      {formatDuration(item.totalMs)}
                    </span>
                    <span className={`text-[10px] text-[var(--text-muted)] font-bold transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Tasks Expanded List */}
                <div
                  className="accordion-content"
                  style={{
                    maxHeight: isExpanded ? `${item.tasks.length * 28 + 8}px` : "0px",
                    opacity: isExpanded ? 1 : 0
                  }}
                >
                  <div className="pl-3 pr-2 pb-2 pt-1 flex flex-col gap-0.5 border-t border-[var(--border-subtle)]/30 bg-[var(--bg-surface)]/20">
                    {item.tasks.map((task, tIdx) => {
                      const displayName = task.intention === "" ? "no intention set" : task.intention;
                      const isNoIntention = task.intention === "";
                      const connector = tIdx === item.tasks.length - 1 ? "└─" : "├─";

                      return (
                        <div
                          key={tIdx}
                          className="flex justify-between items-center text-[11px] py-1 pl-4 pr-1.5 hover:bg-[var(--bg-elevated)]/30 rounded transition-colors group"
                        >
                          <span className={`truncate max-w-[220px] ${
                            isNoIntention ? "italic text-[var(--text-muted)]" : "text-[var(--text-secondary)] font-medium"
                          }`}>
                            <span className="text-[var(--text-muted)] font-mono mr-1.5">{connector}</span>
                            {displayName}
                          </span>
                          <span className="dotted-leader" />
                          <div className="flex items-center gap-2 shrink-0 pl-1">
                            <span className="text-[var(--text-muted)] text-[9px] bg-[var(--border-subtle)]/60 px-1 rounded-sm font-semibold tabular-nums">
                              &times;{task.sessionCount}
                            </span>
                            <span className="text-[var(--text-primary)] font-medium tabular-nums text-xs">
                              {formatDuration(task.totalMs)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
