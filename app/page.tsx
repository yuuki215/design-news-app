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
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const sources = useMemo(() => {
    const uniqueSources = new Set(articles.map((a) => a.source));
    return Array.from(uniqueSources).sort();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      articles.flatMap((a) => a.categories)
    );
    return Array.from(uniqueCategories).sort();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSource =
        selectedSource === "all" || article.source === selectedSource;
      const matchesCategory =
        selectedCategory === "all" ||
        article.categories.includes(selectedCategory);
      return matchesSource && matchesCategory;
    });
  }, [selectedSource, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header meta={meta} />
      <FilterBar
        sources={sources}
        categories={categories}
        selectedSource={selectedSource}
        selectedCategory={selectedCategory}
        onSourceChange={setSelectedSource}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredArticles.length} of {articles.length} articles
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found with the selected filters.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            Updated daily at 8:00 AM JST • Built with Next.js + GitHub Actions
          </p>
          <p className="mt-2">
            Sources:{" "}
            {meta.successfulSources.length > 0
              ? meta.successfulSources.join(", ")
              : "None"}
          </p>
        </div>
      </footer>
    </div>
  );
}
