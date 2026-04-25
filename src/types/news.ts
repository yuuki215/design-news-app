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
  // 拡張フィールド
  region: "jp" | "global";
  language: "ja" | "en" | "other";
  isPickup?: boolean;
  translatedTitle?: string;
  translatedSummary?: string;
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
  // 拡張フィールド
  region: "jp" | "global";
  language: "ja" | "en" | "other";
}

export interface UpdateMeta {
  updatedAt: string;
  status: "success" | "partial" | "failed";
  successfulSources: string[];
  failedSources: string[];
}
