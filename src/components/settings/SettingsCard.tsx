import { useEffect, useState } from "react";
import {
  readSettings,
  writeSettings,
  SETTINGS_UPDATED_EVENT,
  type AppSettings
} from "../../features/settings/settings-state";
import { downloadTelemetryExport } from "../../features/settings/telemetry-export";
import {
  readCategories,
  writeCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  CATEGORIES_UPDATED_EVENT,
  type Category
} from "../../features/categories/categories-state";
import { ConfirmModal } from "../ui/ConfirmModal";

const PREDEFINED_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Green
  "#059669", // Emerald
  "#14B8A6", // Teal
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export function SettingsCard() {
  const [settings, setSettings] = useState<AppSettings>(() => readSettings());
  const [categories, setCategories] = useState<Category[]>(() => readCategories());
  const [openColorPickerId, setOpenColorPickerId] = useState<string | null>(null);
  
  // Modal state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    const handler = () => setSettings(readSettings());
    window.addEventListener(SETTINGS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = () => setCategories(readCategories());
    window.addEventListener(CATEGORIES_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CATEGORIES_UPDATED_EVENT, handler);
  }, []);

  function handleChange(updates: Partial<AppSettings>) {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    writeSettings(newSettings);
  }

  return (
    <div className="flex h-full flex-col pt-2 pb-8">
      
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? History records using this category will revert to the default color.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
      />

      <div className="mb-6 flex justify-center">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Settings</h2>
      </div>

      <div className="space-y-12">
        
        {/* Categories Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-3 px-1">Categories</h3>
          <div className="glass-panel rounded-2xl p-4 space-y-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Manage your focus categories. Colors help distinguish them in your analytics.
            </p>
            
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="relative flex items-center gap-3">
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setOpenColorPickerId(openColorPickerId === cat.id ? null : cat.id)}
                      className="w-6 h-6 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-110"
                      style={{ backgroundColor: cat.color }}
                      title="Choose color"
                    />
                    
                    {openColorPickerId === cat.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setOpenColorPickerId(null)} 
                        />
                        <div className="absolute left-0 top-8 z-50 glass-panel rounded-xl p-3 shadow-xl border border-[var(--border-subtle)] w-40 flex flex-wrap gap-2">
                          {PREDEFINED_COLORS.map(c => (
                            <button
                              key={c}
                              onClick={() => {
                                updateCategory(cat.id, { color: c });
                                setOpenColorPickerId(null);
                              }}
                              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                cat.color === c ? "border-white" : "border-transparent"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                    className="flex-1 rounded-lg border border-transparent bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-subtle)] transition-colors"
                  />
                  <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                    }}
                    className="p-2 text-[var(--text-muted)] hover:text-[#F43F5E] transition-colors rounded-full hover:bg-[var(--bg-elevated)]"
                    title="Delete category"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => createCategory("New Category")}
              className="mt-2 text-xs font-medium text-[var(--accent)] hover:text-white transition-colors flex items-center gap-1 p-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Category
            </button>
          </div>
        </section>

        {/* Timer Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '200ms' }}>
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-3 px-1">Timer</h3>
          <div className="glass-panel rounded-2xl overflow-hidden p-4 space-y-6">
            
            <div className="flex flex-col gap-3">
              <label className="text-sm text-[var(--text-primary)]">Focus Duration</label>
              <div className="flex flex-wrap gap-2">
                {([25, 45, 60] as const).map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleChange({ focusDurationMinutes: mins })}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      settings.focusDurationMinutes === mins
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm text-[var(--text-primary)]">Break Duration</label>
              <div className="flex flex-wrap gap-2">
                {([5, 10, 15] as const).map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleChange({ breakDurationMinutes: mins })}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      settings.breakDurationMinutes === mins
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Behavior Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-3 px-1">Behavior</h3>
          <div className="glass-panel rounded-2xl overflow-hidden">
            
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <label htmlFor="breathingEnabled" className="text-sm text-[var(--text-primary)]">
                Breathing Ritual
              </label>
              <input
                type="checkbox"
                id="breathingEnabled"
                checked={settings.breathingEnabled}
                onChange={(e) => handleChange({ breathingEnabled: e.target.checked })}
                className="toggle-checkbox"
                aria-label="Toggle breathing ritual"
              />
            </div>

            {settings.breathingEnabled && (
              <div className="flex flex-col gap-3 p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] bg-opacity-30 pl-8">
                <label className="text-sm text-[var(--text-secondary)]">Ritual Duration</label>
                <div className="flex flex-wrap gap-2">
                  {([30, 60, 120] as const).map((secs) => (
                    <button
                      key={secs}
                      onClick={() => handleChange({ breathingDurationSeconds: secs })}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        settings.breathingDurationSeconds === secs
                          ? "bg-[var(--accent-soft)] border border-[var(--accent)] text-white"
                          : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--text-muted)]"
                      }`}
                    >
                      {secs < 60 ? `${secs}s` : `${secs / 60}m`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <label htmlFor="notificationsEnabled" className="text-sm text-[var(--text-primary)]">
                Notifications
              </label>
              <input
                type="checkbox"
                id="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleChange({ notificationsEnabled: e.target.checked })}
                className="toggle-checkbox"
                aria-label="Toggle notifications"
              />
            </div>

            <div className="flex flex-col gap-3 p-4 border-b border-[var(--border-subtle)]">
              <label className="text-sm text-[var(--text-primary)]">Animation Intensity</label>
              <div className="flex p-1 bg-[var(--bg-elevated)] rounded-full border border-[var(--border-subtle)] max-w-fit">
                {(["full", "reduced", "minimal"] as const).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => handleChange({ animationIntensity: intensity })}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors capitalize ${
                      settings.animationIntensity === intensity
                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-white"
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <label htmlFor="autoStart" className="text-sm text-[var(--text-primary)] opacity-50">
                Auto-start break
              </label>
              <input
                type="checkbox"
                id="autoStart"
                disabled
                className="toggle-checkbox opacity-50 cursor-not-allowed"
                aria-label="Toggle auto start"
              />
            </div>
          </div>
        </section>

        {/* Shortcuts Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-3 px-1">Shortcuts</h3>
          <div className="glass-panel rounded-2xl overflow-hidden p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-primary)]">Start/Pause Timer</span>
                <div className="flex gap-1">
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">Ctrl</kbd>
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">Shift</kbd>
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">F</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-primary)]">Stop Timer</span>
                <div className="flex gap-1">
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">Ctrl</kbd>
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">Shift</kbd>
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">S</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--text-primary)]">Skip Breathing Ritual</span>
                <div className="flex gap-1">
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">Esc</kbd>
                  <span className="text-xs text-[var(--text-muted)] self-center px-1">or</span>
                  <kbd className="rounded bg-[var(--bg-elevated)] px-2 py-1 text-xs font-mono text-[var(--text-secondary)]">Space</kbd>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-3 px-1">Data</h3>
          <div className="glass-panel rounded-2xl overflow-hidden p-4">
            <p className="text-sm text-[var(--text-primary)] mb-2">Export Data</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Download your sessions, checkpoints, and preferences as JSON.
            </p>
            <button
              type="button"
              onClick={() => {
                downloadTelemetryExport();
              }}
              className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Export JSON Backup
            </button>
          </div>
        </section>
        
        <div className="flex justify-center pt-4 pb-8">
          <p className="text-xs text-[var(--text-muted)] tracking-widest uppercase">
            Focus App V1.0
          </p>
        </div>
      </div>
    </div>
  );
}
