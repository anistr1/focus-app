import { useEffect } from "react";

type CompletionStateProps = {
  mode: "focus" | "break";
  onDismiss: () => void;
  onStartBreak: () => void;
  onStartFocus: () => void;
  autoStartBreak?: boolean;
};

export function CompletionState({ 
  mode, 
  onDismiss, 
  onStartBreak, 
  onStartFocus, 
  autoStartBreak = false 
}: CompletionStateProps) {
  
  useEffect(() => {
    // If it's a focus session and autoStartBreak is enabled,
    // trigger onStartBreak automatically after a 1.5 second celebration delay.
    if (autoStartBreak && mode === "focus") {
      const delayTimer = setTimeout(() => {
        onStartBreak();
      }, 1500);
      return () => clearTimeout(delayTimer);
    }
  }, [autoStartBreak, mode, onStartBreak]);

  const isFocus = mode === "focus";

  return (
    <div className="flex h-full flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-1 duration-1000">
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px] pointer-events-none"
        style={{
          width: 'min(100vw, 400px)',
          height: 'min(100vw, 400px)',
          background: isFocus ? 'var(--success)' : 'var(--accent-glow)'
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm animate-in fade-in duration-1000 delay-300 fill-mode-both">
        <svg 
          width="48" height="48" viewBox="0 0 24 24" fill="none" 
          stroke={isFocus ? "var(--success)" : "var(--accent)"} 
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
          className="mb-6 opacity-80"
        >
          {isFocus ? (
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" />
          ) : (
            <>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </>
          )}
        </svg>

        <h2 className="text-3xl font-light tracking-tight text-[var(--text-primary)] mb-2">
          {isFocus ? "Done ✨" : "Break complete"}
        </h2>
        
        <p className="text-base text-[var(--text-secondary)] mb-12">
          {isFocus ? "Good work. Take a moment to reset." : "Ready to focus again?"}
        </p>

        {isFocus ? (
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={onStartBreak}
              className="rounded-full bg-[var(--bg-elevated)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:text-white border border-[var(--border-subtle)] transition-colors w-full"
            >
              Take a break
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full px-6 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors w-full"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={onStartFocus}
              className="rounded-full bg-[var(--bg-elevated)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:text-white border border-[var(--border-subtle)] transition-colors w-full"
            >
              Start Focus
            </button>
            <button
              type="button"
              onClick={onStartBreak}
              className="rounded-full bg-[var(--bg-elevated)]/40 px-6 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white border border-[var(--border-subtle)] transition-colors w-full"
            >
              Another break
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full px-6 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors w-full text-center"
            >
              Done for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
