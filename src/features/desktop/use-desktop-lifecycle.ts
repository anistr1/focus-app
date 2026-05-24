import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { readSettings, SETTINGS_UPDATED_EVENT } from "../settings/settings-state";

async function syncAutostartPreference(enabled: boolean): Promise<void> {
  try {
    const autostart = await import("@tauri-apps/plugin-autostart");
    const current = await autostart.isEnabled();
    if (enabled && !current) {
      await autostart.enable();
    }
    if (!enabled && current) {
      await autostart.disable();
    }
  } catch {
    // Browser/test runtime or unavailable plugin.
  }
}

export function useDesktopLifecycle(): void {
  useEffect(() => {
    let unlistenClose: (() => void) | null = null;

    const setup = async () => {
      const initial = readSettings();
      void syncAutostartPreference(initial.launchOnStartup);

      try {
        const windowRef = getCurrentWindow();
        unlistenClose = await windowRef.onCloseRequested(async (event) => {
          const settings = readSettings();
          if (!settings.minimizeToTrayOnClose) {
            event.preventDefault();
            try {
              const { invoke } = await import("@tauri-apps/api/core");
              await invoke("exit_app");
            } catch {
              await windowRef.destroy();
            }
            return;
          }
          event.preventDefault();
          await windowRef.hide();
        });
      } catch {
        // Browser/test runtime without Tauri window API.
      }
    };

    setup();

    const onSettingsUpdated = () => {
      const settings = readSettings();
      void syncAutostartPreference(settings.launchOnStartup);
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, onSettingsUpdated);

    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, onSettingsUpdated);
      if (unlistenClose) {
        unlistenClose();
      }
    };
  }, []);
}
