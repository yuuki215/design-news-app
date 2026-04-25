import Parser from "rss-parser";
import { NewsSource, NewsArticle, UpdateMeta } from "../src/types/news";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// メディアフィールドの型
interface MediaField {
  $?: { url?: string; medium?: string };
  url?: string;
}

// カスタムRSSアイテムフィールド
type CustomItemFields = {
  mediaContent?: MediaField | MediaField[];
  mediaThumbnail?: MediaField | MediaField[];
  contentEncoded?: string;
};

const parser = new Parser<Record<string, never>, CustomItemFields>({
  timeout: 10000,
  headers: {
    "User-Agent": "Design News App (RSS Reader)",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

interface RawArticle {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return url;
  }
}

function generateId(url: string, title: string): string {
  const content = `${url}:${title}`;
  return crypto.createHash("md5").update(content).digest("hex");
}

function extractSummary(item: RawArticle): string {
  let text = "";
  if (item.contentSnippet) {
    text = item.contentSnippet;
  } else if (item.content) {
    text = stripHtml(item.content);
  }
  
  text = text.substring(0, 300).trim();
  if (text.length === 300) {
    text += "...";
  }
  return text;
}

// サムネイル画像を各種フィールドから取得
function extractThumbnail(item: CustomItemFields & { enclosure?: { url?: string; type?: string }; content?: string }): string | undefined {
  // 1. enclosure (podcast/media形式)
  if (item.enclosure?.url) {
    const type = item.enclosure.type || "";
    if (!type || type.startsWith("image/")) {
      return item.enclosure.url;
    }
  }

  // 2. media:thumbnail
  const mediaThumbnail = item.mediaThumbnail;
  if (mediaThumbnail) {
    const candidates = Array.isArray(mediaThumbnail) ? mediaThumbnail : [mediaThumbnail];
    const url = candidates[0]?.$?.url || candidates[0]?.url;
    if (url) return url;
  }

  // 3. media:content
  const mediaContent = item.mediaContent;
  if (mediaContent) {
    const candidates = Array.isArray(mediaContent) ? mediaContent : [mediaContent];
    const url = candidates[0]?.$?.url || candidates[0]?.url;
    if (url) return url;
  }

  // 4. content:encoded / content 内の最初のimg src
  const htmlContent = item.contentEncoded || item.content || "";
  if (htmlContent) {
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
      const imgUrl = imgMatch[1];
      // トラッキングピクセルや小アイコンは除外
      if (
        !imgUrl.includes("pixel") &&
        !imgUrl.includes("1x1") &&
        !imgUrl.includes("tracking") &&
        !imgUrl.includes("stat.") &&
        !imgUrl.endsWith(".gif") &&
        imgUrl.startsWith("http")
      ) {
        return imgUrl;
      }
    }
  }

  return undefined;
}

function categorizeByKeywords(title: string, summary: string, hints: string[]): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const categories: string[] = [];
  
  if (/(design|designer|ui|ux|figma|デザイン)/i.test(text)) categories.push("design");
  if (/(css|tailwind|styling|layout)/i.test(text)) categories.push("css");
  if (/(react|vue|frontend|javascript|typescript|フロントエンド)/i.test(text)) categories.push("frontend");
  if (/(product|startup|launch|プロダクト)/i.test(text)) categories.push("product");
  if (/(accessibility|a11y|アクセシビリティ)/i.test(text)) categories.push("accessibility");
  
  hints.forEach(hint => {
    if (!categories.includes(hint)) {
      categories.push(hint);
    }
  });
  
  return categories.length > 0 ? categories : ["general"];
}

async function fetchSource(source: NewsSource): Promise<NewsArticle[]> {
  console.log(`Fetching ${source.name}...`);
  
  try {
    const feed = await parser.parseURL(source.feedUrl);
    const articles: NewsArticle[] = [];
    
    for (const item of feed.items) {
      if (!item.title || !item.link) continue;
      
      const url = normalizeUrl(item.link);
      const title = item.title.trim();
      const rawItem = item as RawArticle;
      const summary = extractSummary(rawItem);
      const categories = categorizeByKeywords(title, summary, source.categoryHints);
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
      const thumbnail = extractThumbnail(item as CustomItemFields & { enclosure?: { url?: string; type?: string }; content?: string });
      
      const article: NewsArticle = {
        id: generateId(url, title),
        title,
        url,
        source: source.name,
        sourceType: source.type,
        publishedAt,
        summary,
        categories,
        score: 0,
        fetchedAt: new Date().toISOString(),
        region: source.region,
        language: source.language,
      };

      if (thumbnail) {
        article.thumbnail = thumbnail;
      }

      articles.push(article);
    }
    
    const withThumb = articles.filter(a => a.thumbnail).length;
    console.log(`✓ ${source.name}: ${articles.length} articles (${withThumb} with thumbnail)`);
    return articles;
  } catch (error) {
    console.error(`✗ ${source.name}: ${error}`);
    return [];
  }
}

function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Map<string, NewsArticle>();
  
  for (const article of articles) {
    const existing = seen.get(article.id);
    if (!existing) {
      seen.set(article.id, article);
    }
  }
  
  return Array.from(seen.values());
}

function calculateScore(article: NewsArticle, sourcePriority: number): number {
  let score = 0;
  
  // Region priority: 日本記事を優先
  if (article.region === "jp") {
    score += 15;
  } else {
    score += 5;
  }
  
  // Recency score (0-10)
  const ageMs = Date.now() - new Date(article.publishedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 1) score += 10;
  else if (ageDays < 3) score += 7;
  else if (ageDays < 7) score += 4;
  else if (ageDays < 14) score += 2;

  // サムネイルありはわずかにスコアアップ
  if (article.thumbnail) {
    score += 1;
  }
  
  // Source priority (0-10)
  score += sourcePriority;
  
  // Category relevance
  const designCategories = ["design", "ui", "ux", "css", "frontend"];
  const matchCount = article.categories.filter(cat => designCategories.includes(cat)).length;
  score += matchCount * 2;
  
  return score;
}

// 同一媒体の記事数を制限
function limitPerSource(articles: NewsArticle[], maxPerSource: number = 3): NewsArticle[] {
  const sourceCounts = new Map<string, number>();
  const result: NewsArticle[] = [];
  
  for (const article of articles) {
    const count = sourceCounts.get(article.source) || 0;
    if (count < maxPerSource) {
      result.push(article);
      sourceCounts.set(article.source, count + 1);
    }
  }
  
  return result;
}

// タイトル類似度チェック（簡易版）
function areTitlesSimilar(title1: string, title2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\sぁ-んァ-ヶー一-龠]/g, "");
  const t1 = normalize(title1);
  const t2 = normalize(title2);
  
  // 短いタイトルの80%以上が含まれていたら類似と判定
  const shorter = t1.length < t2.length ? t1 : t2;
  const longer = t1.length < t2.length ? t2 : t1;
  
  if (shorter.length < 10) return false;
  
  const threshold = Math.floor(shorter.length * 0.8);
  let matchCount = 0;
  for (let i = 0; i < shorter.length - 3; i++) {
    const chunk = shorter.substring(i, i + 3);
    if (longer.includes(chunk)) {
      matchCount += 3;
    }
  }
  
  return matchCount >= threshold;
}

function deduplicateSimilarTitles(articles: NewsArticle[]): NewsArticle[] {
  const result: NewsArticle[] = [];
  
  for (const article of articles) {
    const isDuplicate = result.some(existing => 
      areTitlesSimilar(article.title, existing.title)
    );
    
    if (!isDuplicate) {
      result.push(article);
    }
  }
  
  return result;
}

// 鮮度フィルタ: 指定日数以内の記事のみ返す
function filterByFreshness(articles: NewsArticle[], maxAgeDays: number): NewsArticle[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);
  return articles.filter(a => new Date(a.publishedAt) >= cutoff);
}

async function main() {
  const sourcesPath = path.join(__dirname, "../data/sources.json");
  const articlesPath = path.join(__dirname, "../data/articles.json");
  const metaPath = path.join(__dirname, "../data/last-updated.json");
  
  const sources: NewsSource[] = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
  const enabledSources = sources.filter(s => s.enabled);
  
  console.log(`\n📰 Fetching from ${enabledSources.length} sources...\n`);
  
  const results = await Promise.all(
    enabledSources.map(source => fetchSource(source))
  );
  
  let allArticles: NewsArticle[] = [];
  const successfulSources: string[] = [];
  const failedSources: string[] = [];
  
  results.forEach((articles, index) => {
    const source = enabledSources[index];
    if (articles.length > 0) {
      successfulSources.push(source.name);
      allArticles = allArticles.concat(articles);
    } else {
      failedSources.push(source.name);
    }
  });
  
  // Deduplicate
  allArticles = deduplicateArticles(allArticles);

  // 鮮度フィルタ: まず30日以内に絞る
  const fresh30 = filterByFreshness(allArticles, 30);
  if (fresh30.length >= 5) {
    allArticles = fresh30;
    console.log(`\n📅 Freshness filter (30d): ${allArticles.length} articles`);
  } else {
    // 30日以内が少ない場合は60日まで緩める
    const fresh60 = filterByFreshness(allArticles, 60);
    allArticles = fresh60.length >= 3 ? fresh60 : allArticles;
    console.log(`\n📅 Freshness filter relaxed (60d): ${allArticles.length} articles`);
  }
  
  // Calculate scores
  allArticles = allArticles.map(article => {
    const source = sources.find(s => s.name === article.source);
    const priority = source?.priority || 5;
    return {
      ...article,
      score: calculateScore(article, priority),
    };
  });
  
  // Sort by score descending
  allArticles.sort((a, b) => b.score - a.score);
  
  // 同一媒体制限
  allArticles = limitPerSource(allArticles, 3);
  
  // 類似タイトル除外
  allArticles = deduplicateSimilarTitles(allArticles);

  // 日本 / 海外の鮮度統計ログ
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const freshJp = allArticles.filter(a => a.region === "jp" && new Date(a.publishedAt) >= twoWeeksAgo);
  const freshGlobal = allArticles.filter(a => a.region === "global" && new Date(a.publishedAt) >= twoWeeksAgo);
  console.log(`\n📊 Fresh (2w): JP=${freshJp.length}, Global=${freshGlobal.length}`);
  console.log(`📊 Total after filters: ${allArticles.length}`);
  
  // 5〜10本に厳選
  const targetCount = Math.max(5, Math.min(10, allArticles.length));
  allArticles = allArticles.slice(0, targetCount);
  
  // ピックアップ設定（上位1〜2本）
  const pickupCount = allArticles.length >= 5 ? 2 : 1;
  allArticles = allArticles.map((article, index) => ({
    ...article,
    isPickup: index < pickupCount,
  }));
  
  const meta: UpdateMeta = {
    updatedAt: new Date().toISOString(),
    status: failedSources.length === 0 ? "success" : 
            successfulSources.length > 0 ? "partial" : "failed",
    successfulSources,
    failedSources,
  };
  
  fs.writeFileSync(articlesPath, JSON.stringify(allArticles, null, 2));
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  
  const withThumb = allArticles.filter(a => a.thumbnail).length;
  console.log(`\n✓ Saved ${allArticles.length} articles (${pickupCount} pickup, ${withThumb} with thumbnail)`);
  console.log(`✓ Status: ${meta.status}`);
  console.log(`✓ Successful: ${successfulSources.join(", ")}`);
  if (failedSources.length > 0) {
    console.log(`✗ Failed: ${failedSources.join(", ")}`);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
