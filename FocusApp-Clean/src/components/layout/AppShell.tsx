import { FocusTimerCard } from "../timer/FocusTimerCard";
import { SessionHistoryCard } from "../sessions/SessionHistoryCard";
import { AnalyticsCard } from "../analytics/AnalyticsCard";
import { SettingsCard } from "../settings/SettingsCard";
import { useDesktopLifecycle } from "../../features/desktop/use-desktop-lifecycle";
import { UpdateStatusCard } from "../updater/UpdateStatusCard";

export function AppShell() {
  useDesktopLifecycle();

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[120rem] flex-col gap-10 px-6 py-8 md:px-8 md:py-10">
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            Windows Focus App
          </p>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl 2xl:text-6xl">
              Calm desktop focus, scaffolded for offline-first rituals.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[var(--text-secondary)] md:text-lg md:leading-8">
              Local-first session flow with timestamp-based timing, calm controls,
              and resilient behavior under backgrounding and resume scenarios.
            </p>
          </div>
          <UpdateStatusCard />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <FocusTimerCard />
          <SessionHistoryCard />
        </section>

        <section>
          <AnalyticsCard />
        </section>

        <section>
          <SettingsCard />
        </section>
      </div>
    </main>
  );
}
