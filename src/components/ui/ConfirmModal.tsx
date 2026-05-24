import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="glass-panel relative flex flex-col w-full max-w-sm rounded-2xl overflow-hidden pointer-events-auto shadow-2xl animate-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              {title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {message}
            </p>
          </div>
          
          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
              }}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                isDestructive 
                  ? "bg-[#F43F5E] text-white hover:bg-[#E11D48] shadow-[0_2px_10px_rgba(244,63,94,0.3)]" 
                  : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
