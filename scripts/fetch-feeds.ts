import Parser from "rss-parser";
import { NewsSource, NewsArticle, UpdateMeta } from "../src/types/news";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Design News App (RSS Reader)",
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

function categorizeByKeywords(title: string, summary: string, hints: string[]): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const categories: string[] = [];
  
  if (/(design|designer|ui|ux|figma)/i.test(text)) categories.push("design");
  if (/(css|tailwind|styling|layout)/i.test(text)) categories.push("css");
  if (/(react|vue|frontend|javascript|typescript)/i.test(text)) categories.push("frontend");
  if (/(product|startup|launch)/i.test(text)) categories.push("product");
  if (/(accessibility|a11y)/i.test(text)) categories.push("accessibility");
  
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
      const summary = extractSummary(item as RawArticle);
      const categories = categorizeByKeywords(title, summary, source.categoryHints);
      const publishedAt = item.isoDate || item.pubDate || new Date().toISOString();
      
      articles.push({
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
      });
    }
    
    console.log(`✓ ${source.name}: ${articles.length} articles`);
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
  
  // Recency score (0-10)
  const ageMs = Date.now() - new Date(article.publishedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 1) score += 10;
  else if (ageDays < 3) score += 7;
  else if (ageDays < 7) score += 4;
  else if (ageDays < 14) score += 2;
  
  // Source priority (0-10)
  score += sourcePriority;
  
  // Category relevance
  const designCategories = ["design", "ui", "ux", "css", "frontend"];
  const matchCount = article.categories.filter(cat => designCategories.includes(cat)).length;
  score += matchCount * 2;
  
  return score;
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
  
  // Keep top 100
  allArticles = allArticles.slice(0, 100);
  
  const meta: UpdateMeta = {
    updatedAt: new Date().toISOString(),
    status: failedSources.length === 0 ? "success" : 
            successfulSources.length > 0 ? "partial" : "failed",
    successfulSources,
    failedSources,
  };
  
  fs.writeFileSync(articlesPath, JSON.stringify(allArticles, null, 2));
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  
  console.log(`\n✓ Saved ${allArticles.length} articles`);
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
