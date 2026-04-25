"use client";

interface FilterBarProps {
  categories: string[];
  selectedRegion: "all" | "jp" | "global";
  selectedCategory: string;
  onRegionChange: (region: "all" | "jp" | "global") => void;
  onCategoryChange: (category: string) => void;
}

export function FilterBar({
  categories,
  selectedRegion,
  selectedCategory,
  onRegionChange,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <div
      className="py-6"
      style={{
        background: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label
              className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              地域
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value as "all" | "jp" | "global")}
              className="w-full px-4 py-2 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
              style={{
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="all">すべて</option>
              <option value="jp">🇯🇵 日本</option>
              <option value="global">🌍 海外</option>
            </select>
          </div>

          <div className="flex-1">
            <label
              className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              カテゴリ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg transition-all focus:outline-none focus:ring-2"
              style={{
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              <option value="all">すべて</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
