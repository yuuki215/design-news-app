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
      ? { bg: "var(--color-accent-green)", color: "var(--color-text-primary)" }
      : meta.status === "partial"
      ? { bg: "var(--color-accent-peach)", color: "var(--color-text-primary)" }
      : { bg: "var(--color-accent-pink)", color: "var(--color-text-primary)" };

  return (
    <header
      className="sticky top-0 z-10 backdrop-blur-sm"
      style={{
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              Design News
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
              日本のデザイン最新ニュース • 厳選5〜10本を毎朝配信
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: statusColor.bg,
                color: statusColor.color,
              }}
            >
              {meta.status === "success" ? "✓" : meta.status === "partial" ? "△" : "✗"} {meta.status}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
