import { useEffect, useState } from "react";
import type { Update } from "@tauri-apps/plugin-updater";
import { check } from "@tauri-apps/plugin-updater";
import { TIMER_STATUS_EVENT, type SharedTimerStatus } from "../timer/timer-events";

export type UpdaterState = {
  readyVersion: string | null;
  checking: boolean;
  lastError: string | null;
  isSessionActive: boolean;
  installReady: boolean;
};

const IS_TEST_RUNTIME =
  typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("jsdom");

export function useUpdaterState(): { state: UpdaterState; installWhenSafe: () => Promise<void> } {
  const [pendingUpdate, setPendingUpdate] = useState<Update | null>(null);
  const [readyVersion, setReadyVersion] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    const onTimerStatus = (event: Event) => {
      const status = (event as CustomEvent<SharedTimerStatus>).detail;
      setIsSessionActive(status === "running");
    };

    window.addEventListener(TIMER_STATUS_EVENT, onTimerStatus as EventListener);
    return () => window.removeEventListener(TIMER_STATUS_EVENT, onTimerStatus as EventListener);
  }, []);

  useEffect(() => {
    if (IS_TEST_RUNTIME) {
      return;
    }

    let cancelled = false;

    const checkForUpdates = async () => {
      setChecking(true);
      try {
        const available = await check();
        if (!available) {
          if (!cancelled) {
            setChecking(false);
          }
          return;
        }

        await available.download();
        if (!cancelled) {
          setPendingUpdate(available);
          setReadyVersion(available.version);
          setLastError(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Update check failed quietly on startup:", error);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    void checkForUpdates();

    return () => {
      cancelled = true;
    };
  }, []);

  const installWhenSafe = async () => {
    if (!pendingUpdate) {
      return;
    }
    await pendingUpdate.install();
    setPendingUpdate(null);
    setReadyVersion(null);
  };

  return {
    state: {
      readyVersion,
      checking,
      lastError,
      isSessionActive,
      installReady: pendingUpdate !== null
    },
    installWhenSafe
  };
}
