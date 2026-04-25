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
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 leading-snug flex-1">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-600 transition-colors"
          >
            {article.title}
          </a>
        </h2>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {article.summary}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
          {article.source}
        </span>
        <span className="text-gray-400">•</span>
        <time className="text-gray-500">{publishedDate}</time>
        {article.categories.length > 0 && (
          <>
            <span className="text-gray-400">•</span>
            <div className="flex gap-1 flex-wrap">
              {article.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
