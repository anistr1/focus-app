import { useState } from "react";
import { useUpdaterState } from "../../features/updater/use-updater-state";

export function UpdateStatusCard() {
  const { state, installWhenSafe } = useUpdaterState();
  const [installMessage, setInstallMessage] = useState<string | null>(null);

  if (!state.readyVersion && !state.lastError) {
    return null;
  }

  return (
    <article
      className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-secondary)]"
      role="status"
      aria-live="polite"
    >
      {state.readyVersion ? (
        <>
          <p className="font-medium text-[var(--text-primary)]">Update ready in background</p>
          <p className="mt-1">Version {state.readyVersion} has been prepared quietly.</p>
          {state.isSessionActive ? (
            <p className="mt-2">Install controls stay hidden while a focus session is active.</p>
          ) : (
            <button
              type="button"
              onClick={() => {
                void installWhenSafe()
                  .then(() => setInstallMessage("Update installed. Restart when convenient."))
                  .catch(() => setInstallMessage("Install failed. The app will continue normally."));
              }}
              className="mt-3 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs"
            >
              Install update
            </button>
          )}
        </>
      ) : null}

      {state.lastError ? <p>{state.lastError}</p> : null}
      {installMessage ? <p className="mt-2">{installMessage}</p> : null}
      {state.checking ? <p className="mt-2 text-xs">Checking for updates in background...</p> : null}
    </article>
  );
}

