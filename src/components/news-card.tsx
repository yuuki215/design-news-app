import { NewsArticle } from "../types/news";

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const publishedDate = new Date(article.publishedAt).toLocaleDateString(
    "ja-JP",
    {
      month: "short",
      day: "numeric",
    }
  );

  return (
    <article
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              background: article.region === "jp" ? "var(--color-region-jp)" : "var(--color-region-global)",
              color: "var(--color-text-primary)",
            }}
          >
            {article.region === "jp" ? "🇯🇵" : "🌍"}
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
            {article.source}
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>•</span>
          <time className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {publishedDate}
          </time>
        </div>

        <h2 className="text-base font-semibold mb-3 leading-snug line-clamp-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--color-text-primary)" }}
          >
            {article.title}
          </a>
        </h2>

        <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {article.summary}
        </p>

        {article.categories.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {article.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-1 rounded text-xs"
                style={{
                  background: "var(--color-accent-blue)",
                  color: "var(--color-text-primary)",
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
