import { formatDuration } from "./AnalyticsCard";

type QualityFooterProps = {
  bestFocusWindowHour: number | null;
  avgSessionMs: number;
  completionRate: number;
};

function formatHourRange(hour: number | null): string {
  if (hour === null) return "--";
  const startHour = hour;
  const endHour = (hour + 1) % 24;
  
  const getLabel = (h: number) => {
    if (h === 0) return "12am";
    if (h === 12) return "12pm";
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  };

  return `${getLabel(startHour)}–${getLabel(endHour)}`;
}

export function QualityFooter({ bestFocusWindowHour, avgSessionMs, completionRate }: QualityFooterProps) {
  return (
    <div className="w-full flex justify-center items-center py-2 shrink-0 border-t border-[var(--border-subtle)] mt-auto" style={{ height: "36px" }}>
      <span className="text-[11px] text-[var(--text-muted)] font-medium tracking-wide">
        Best: {formatHourRange(bestFocusWindowHour)} &middot; Avg {formatDuration(avgSessionMs)} &middot; {completionRate}% complete
      </span>
    </div>
  );
}
