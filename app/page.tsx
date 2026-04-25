"use client";

import { useState, useMemo } from "react";
import { Header } from "../src/components/header";
import { FilterBar } from "../src/components/filter-bar";
import { NewsCard } from "../src/components/news-card";
import { NewsArticle, UpdateMeta } from "../src/types/news";

import articlesData from "../data/articles.json";
import metaData from "../data/last-updated.json";

const articles: NewsArticle[] = articlesData as NewsArticle[];
const meta: UpdateMeta = metaData as UpdateMeta;

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<"all" | "jp" | "global">("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      articles.flatMap((a) => a.categories)
    );
    return Array.from(uniqueCategories).sort();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesRegion =
        selectedRegion === "all" || article.region === selectedRegion;
      const matchesCategory =
        selectedCategory === "all" ||
        article.categories.includes(selectedCategory);
      return matchesRegion && matchesCategory;
    });
  }, [selectedRegion, selectedCategory]);

  const pickupArticles = filteredArticles.filter((a) => a.isPickup);
  const regularArticles = filteredArticles.filter((a) => !a.isPickup);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Header meta={meta} />
      <FilterBar
        categories={categories}
        selectedRegion={selectedRegion}
        selectedCategory={selectedCategory}
        onRegionChange={setSelectedRegion}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* ピックアップセクション */}
        {pickupArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-sm font-medium uppercase tracking-wider mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Today&apos;s Picks
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {pickupArticles.map((article) => (
                <article
                  key={article.id}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  style={{
                    background: "var(--color-bg-pickup)",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  {article.thumbnail && (
                    <div className="w-full overflow-hidden" style={{ height: "220px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.thumbnail}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: article.region === "jp" ? "var(--color-region-jp)" : "var(--color-region-global)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {article.region === "jp" ? "🇯🇵 日本" : "🌍 海外"}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        {article.source}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 leading-snug group-hover:text-purple-600 transition-colors">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {article.title}
                      </a>
                    </h3>
                    <p className="text-base mb-6 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {article.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <time style={{ color: "var(--color-text-muted)" }}>
                        {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      {article.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 rounded"
                          style={{
                            background: "var(--color-accent-purple)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 通常記事一覧 */}
        {regularArticles.length > 0 && (
          <section>
            <h2 className="text-sm font-medium uppercase tracking-wider mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Latest News ({regularArticles.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <p style={{ color: "var(--color-text-muted)" }}>選択した条件に合う記事が見つかりませんでした。</p>
          </div>
        )}
      </main>

      <footer className="mt-20 py-12" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto px-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          <p>毎朝 8:00 JST 自動更新 • Next.js + GitHub Actions</p>
          <p className="mt-2">
            配信元: {meta.successfulSources.length > 0 ? meta.successfulSources.join(", ") : "なし"}
          </p>
        </div>
      </footer>
    </div>
  );
}
