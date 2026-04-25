import { UpdateMeta } from "../types/news";

interface HeaderProps {
  meta: UpdateMeta;
}

export function Header({ meta }: HeaderProps) {
  const lastUpdated = new Date(meta.updatedAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });

  const statusColor =
    meta.status === "success"
      ? "bg-emerald-100 text-emerald-800"
      : meta.status === "partial"
      ? "bg-amber-100 text-amber-800"
      : "bg-red-100 text-red-800";

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Design News
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Daily design & frontend updates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
            >
              {meta.status}
            </span>
            <span className="text-xs text-gray-500">
              Updated: {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
