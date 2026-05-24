export const CATEGORIES_KEY = "focus-app:categories";
export const CATEGORIES_UPDATED_EVENT = "focus-app:categories-updated";

export type Category = {
  id: string;
  name: string;
  color: string;
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-session", name: "Session", color: "var(--accent)" },
  { id: "cat-health", name: "Health", color: "#10B981" },
  { id: "cat-learn", name: "Learn", color: "#3B82F6" },
];

export function readCategories(): Category[] {
  try {
    const raw = window.localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw) as Category[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    return parsed;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function writeCategories(categories: Category[]): void {
  window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  window.dispatchEvent(new CustomEvent(CATEGORIES_UPDATED_EVENT));
}

export function createCategory(name: string, color?: string): Category {
  const current = readCategories();
  
  // Basic colors to cycle through if none provided
  const fallbackColors = ["#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6", "#F43F5E"];
  const newColor = color || fallbackColors[current.length % fallbackColors.length];
  
  const newCategory: Category = {
    id: `cat-${Date.now().toString(36)}`,
    name,
    color: newColor
  };
  
  writeCategories([...current, newCategory]);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): void {
  const current = readCategories();
  const updated = current.map(cat => 
    cat.id === id ? { ...cat, ...updates } : cat
  );
  writeCategories(updated);
}

export function deleteCategory(id: string): void {
  const current = readCategories();
  const filtered = current.filter(cat => cat.id !== id);
  writeCategories(filtered);
}
