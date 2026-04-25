"use client";

interface FilterBarProps {
  sources: string[];
  categories: string[];
  selectedSource: string;
  selectedCategory: string;
  onSourceChange: (source: string) => void;
  onCategoryChange: (category: string) => void;
}

export function FilterBar({
  sources,
  categories,
  selectedSource,
  selectedCategory,
  onSourceChange,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Categories</option>
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
