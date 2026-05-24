import { FocusTimerCard } from "../timer/FocusTimerCard";
import { SessionHistoryCard } from "../sessions/SessionHistoryCard";
import { AnalyticsCard } from "../analytics/AnalyticsCard";
import { SettingsCard } from "../settings/SettingsCard";
import { useDesktopLifecycle } from "../../features/desktop/use-desktop-lifecycle";
import { UpdateStatusCard } from "../updater/UpdateStatusCard";
import { useEffect, useState } from "react";
import { TIMER_STATUS_EVENT } from "../../features/timer/timer-events";

type Tab = "timer" | "sessions" | "analytics" | "settings";

export function AppShell() {
  useDesktopLifecycle();
  const [activeTab, setActiveTab] = useState<Tab>("timer");
  const [timerStatus, setTimerStatus] = useState("idle");

  useEffect(() => {
    const handler = (e: Event) => {
      const status = (e as CustomEvent).detail;
      setTimerStatus(status);
      
      const root = document.getElementById("root");
      if (root) {
        root.className = ""; // clear all
        if (status === "running") {
          // Timer card will send its mode via another mechanism, or we can guess.
          // For now let's set a generic running mood or let timer control it directly.
          // Actually, we can rely on the timer setting the mood class directly, 
          // or we can set it here based on status. Let's do a simple approach here.
        }
      }
    };
    window.addEventListener(TIMER_STATUS_EVENT, handler);
    return () => window.removeEventListener(TIMER_STATUS_EVENT, handler);
  }, []);

  return (
    <main className="flex h-screen overflow-hidden bg-transparent">
      {/* Left Navigation Sidebar */}
      <nav className="flex w-[72px] shrink-0 flex-col items-center justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-base)] py-6 z-50">
        <div className="flex flex-col gap-6 w-full items-center">
          <button
            onClick={() => setActiveTab("timer")}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === "timer" 
                ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
            }`}
            title="Timer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
          
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === "analytics" 
                ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
            }`}
            title="Analytics"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === "sessions" 
                ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
            }`}
            title="Sessions"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
              activeTab === "settings" 
                ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
            }`}
            title="Settings"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Title Bar Region (Draggable in Tauri) */}
        <div data-tauri-drag-region className="flex h-10 shrink-0 items-center justify-between px-4 absolute top-0 left-0 right-0 z-50">
          <span className="text-xs font-medium tracking-wide text-[var(--text-secondary)]"></span>
          <div className="scale-75 origin-right">
             <UpdateStatusCard />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-10">
          {activeTab === "timer" && <FocusTimerCard />}
          {activeTab === "sessions" && <SessionHistoryCard />}
          {activeTab === "analytics" && <AnalyticsCard />}
          {activeTab === "settings" && <SettingsCard />}
        </div>
      </div>
    </main>
  );
}
