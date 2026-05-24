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
  const [isMiniWidget, setIsMiniWidget] = useState(false);



  const toggleMiniWidget = async () => {
    try {
      const { getCurrentWindow, PhysicalSize } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      if (isMiniWidget) {
        await win.setAlwaysOnTop(false);
        await win.setSize(new PhysicalSize(450, 675));
        setIsMiniWidget(false);
      } else {
        setActiveTab("timer"); // Ensure timer is active
        await win.setAlwaysOnTop(true);
        await win.setSize(new PhysicalSize(250, 250));
        setIsMiniWidget(true);
      }
    } catch (e) {
      console.error("Failed to toggle mini widget:", e);
    }
  };

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
    <main className="flex w-full h-full overflow-hidden bg-transparent select-none">
      {/* Left Navigation Sidebar - Hidden in mini mode */}
      {!isMiniWidget && (
        <nav className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-base)] py-6 z-50">
          <div className="flex flex-col gap-6 w-full items-center">
            <button
              onClick={() => setActiveTab("timer")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "timer" 
                  ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              }`}
              title="Timer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
            
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "analytics" 
                  ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              }`}
              title="Analytics"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </button>

            <button
              onClick={() => setActiveTab("sessions")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "sessions" 
                  ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              }`}
              title="Sessions"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="scale-75 origin-bottom">
               <UpdateStatusCard />
            </div>
            
            <button
              onClick={toggleMiniWidget}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              title="Mini Widget"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14h6v6"></path>
                <path d="M20 10h-6V4"></path>
                <path d="M14 10l7-7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "settings" 
                  ? "text-[var(--accent)] bg-[var(--bg-elevated)] shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              }`}
              title="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative bg-[var(--bg-base)]">


        <div className="flex-1 relative overflow-hidden bg-transparent">
          <div className={`absolute inset-0 overflow-y-auto overflow-x-hidden ${!isMiniWidget ? 'px-6 pb-6 pt-6' : ''} transition-all duration-500 ease-out ${activeTab === "timer" ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"}`}>
            <FocusTimerCard isMiniWidget={isMiniWidget} onExpand={toggleMiniWidget} />
          </div>
          <div className={`absolute inset-0 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-6 transition-all duration-500 ease-out ${activeTab === "sessions" ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"}`}>
            <SessionHistoryCard />
          </div>
          <div className={`absolute inset-0 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-6 transition-all duration-500 ease-out ${activeTab === "analytics" ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"}`}>
            <AnalyticsCard />
          </div>
          <div className={`absolute inset-0 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-6 transition-all duration-500 ease-out ${activeTab === "settings" ? "opacity-100 translate-y-0 z-10" : "opacity-0 translate-y-2 pointer-events-none z-0"}`}>
            <SettingsCard />
          </div>
        </div>
      </div>
    </main>
  );
}
