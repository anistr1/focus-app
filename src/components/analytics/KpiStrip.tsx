import { formatDuration } from "./AnalyticsCard";

type KpiStripProps = {
  totalMs: number;
  sessionsCount: number;
  completionRate: number;
  streakDays: number;
};

export function KpiStrip({ totalMs, sessionsCount, completionRate, streakDays }: KpiStripProps) {
  return (
    <div className="flex gap-2 w-full mb-3 shrink-0" style={{ height: "64px" }}>
      <div className="glass-panel flex-1 flex flex-col justify-center rounded-xl py-2 px-3">
        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider leading-none mb-1">
          Total
        </span>
        <span className="text-lg font-light text-[var(--text-primary)] leading-none tabular-nums truncate">
          {formatDuration(totalMs)}
        </span>
      </div>

      <div className="glass-panel flex-1 flex flex-col justify-center rounded-xl py-2 px-3">
        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider leading-none mb-1">
          Sessions
        </span>
        <span className="text-lg font-light text-[var(--text-primary)] leading-none tabular-nums truncate">
          {sessionsCount}
        </span>
      </div>

      <div className="glass-panel flex-1 flex flex-col justify-center rounded-xl py-2 px-3">
        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider leading-none mb-1">
          Complete
        </span>
        <span className="text-lg font-light text-[var(--text-primary)] leading-none tabular-nums truncate">
          {completionRate}%
        </span>
      </div>

      <div className="glass-panel flex-1 flex flex-col justify-center rounded-xl py-2 px-3">
        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider leading-none mb-1">
          Streak
        </span>
        <span className="text-lg font-light text-[var(--text-primary)] leading-none tabular-nums truncate">
          {streakDays}d <span className="text-xs">🔥</span>
        </span>
      </div>
    </div>
  );
}
