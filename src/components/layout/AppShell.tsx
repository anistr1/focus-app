import { FocusTimerCard } from "../timer/FocusTimerCard";
import { SessionHistoryCard } from "../sessions/SessionHistoryCard";
import { AnalyticsCard } from "../analytics/AnalyticsCard";
import { SettingsCard } from "../settings/SettingsCard";
import { useDesktopLifecycle } from "../../features/desktop/use-desktop-lifecycle";
import { UpdateStatusCard } from "../updater/UpdateStatusCard";
import { useEffect, useState } from "react";
import { TIMER_STATUS_EVENT } from "../../features/timer/timer-events";
import { motion } from "framer-motion";
import { Timer, BarChart2, History, Settings, Minimize2 } from "lucide-react";

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
            {/* Timer Tab */}
            <button
              onClick={() => setActiveTab("timer")}
              className={`relative flex items-center justify-center p-2.5 rounded-xl transition-colors cursor-pointer z-10 ${
                activeTab === "timer" 
                  ? "text-[var(--accent)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
              title="Timer"
            >
              {activeTab === "timer" && (
                <motion.div
                  layoutId="activeTabCapsule"
                  className="absolute inset-0 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] z-[-1]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Timer className="w-5 h-5" />
            </button>
            
            {/* Analytics Tab */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`relative flex items-center justify-center p-2.5 rounded-xl transition-colors cursor-pointer z-10 ${
                activeTab === "analytics" 
                  ? "text-[var(--accent)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
              title="Analytics"
            >
              {activeTab === "analytics" && (
                <motion.div
                  layoutId="activeTabCapsule"
                  className="absolute inset-0 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] z-[-1]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <BarChart2 className="w-5 h-5" />
            </button>

            {/* Sessions Tab */}
            <button
              onClick={() => setActiveTab("sessions")}
              className={`relative flex items-center justify-center p-2.5 rounded-xl transition-colors cursor-pointer z-10 ${
                activeTab === "sessions" 
                  ? "text-[var(--accent)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
              title="Sessions"
            >
              {activeTab === "sessions" && (
                <motion.div
                  layoutId="activeTabCapsule"
                  className="absolute inset-0 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] z-[-1]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <History className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="scale-75 origin-bottom">
               <UpdateStatusCard />
            </div>
            
            {/* Mini Widget Toggle */}
            <button
              onClick={toggleMiniWidget}
              className="flex items-center justify-center p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer"
              title="Mini Widget"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            {/* Settings Tab */}
            <button
              onClick={() => setActiveTab("settings")}
              className={`relative flex items-center justify-center p-2.5 rounded-xl transition-colors cursor-pointer z-10 ${
                activeTab === "settings" 
                  ? "text-[var(--accent)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
              title="Settings"
            >
              {activeTab === "settings" && (
                <motion.div
                  layoutId="activeTabCapsule"
                  className="absolute inset-0 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] z-[-1]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Settings className="w-5 h-5" />
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
