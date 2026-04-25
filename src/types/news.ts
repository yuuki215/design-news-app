export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: "rss" | "api";
  publishedAt: string;
  summary: string;
  categories: string[];
  thumbnail?: string;
  score: number;
  fetchedAt: string;
}

export interface NewsSource {
  id: string;
  name: string;
  type: "rss" | "api";
  feedUrl: string;
  siteUrl: string;
  enabled: boolean;
  priority: number;
  categoryHints: string[];
}

export interface UpdateMeta {
  updatedAt: string;
  status: "success" | "partial" | "failed";
  successfulSources: string[];
  failedSources: string[];
}
