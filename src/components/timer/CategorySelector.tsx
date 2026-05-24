import { useState, useRef, useEffect } from "react";
import { Category, createCategory } from "../../features/categories/categories-state";

type CategorySelectorProps = {
  categories: Category[];
  selectedId: string;
  onChange: (id: string) => void;
};

export function CategorySelector({ categories, selectedId, onChange }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find((c) => c.id === selectedId) || categories[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewCategoryName("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      const newCat = createCategory(trimmed);
      onChange(newCat.id);
    }
    setIsCreating(false);
    setIsOpen(false);
    setNewCategoryName("");
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors shadow-sm"
      >
        <span 
          className="h-2 w-2 rounded-full" 
          style={{ backgroundColor: selectedCategory?.color || "var(--accent)" }} 
        />
        {selectedCategory?.name || "Session"}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 mt-2 w-48 -translate-x-1/2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  cat.id === selectedId 
                    ? "bg-[var(--bg-elevated)] text-white" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-white"
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="border-t border-[var(--border-subtle)] p-1">
            {isCreating ? (
              <form onSubmit={handleCreate} className="flex items-center px-2 py-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name..."
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create category
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
