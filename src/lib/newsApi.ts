// src/lib/newsApi.ts
import { NewsArticle, NewsCategory } from "@/types";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

const CATEGORY_QUERIES: Record<NewsCategory, string> = {
  economy: "India economy GDP inflation RBI monetary policy",
  banking: "RBI bank SBI HDFC ICICI banking sector India",
  government: "India government policy scheme budget ministry",
  international: "India foreign policy UN G20 bilateral",
  "science-tech": "ISRO technology innovation India science",
  awards: "India award padma recognition prize",
  sports: "India cricket Olympics sports championship",
  appointments: "India appointed new chief director secretary",
  general: "India current affairs 2024 2025",
};

function mapToCategory(title: string, description: string): NewsCategory {
  const text = (title + " " + description).toLowerCase();
  if (text.includes("rbi") || text.includes("bank") || text.includes("loan") || text.includes("credit"))
    return "banking";
  if (text.includes("gdp") || text.includes("inflation") || text.includes("economy") || text.includes("rupee"))
    return "economy";
  if (text.includes("isro") || text.includes("tech") || text.includes("ai") || text.includes("satellite"))
    return "science-tech";
  if (text.includes("award") || text.includes("padma") || text.includes("prize") || text.includes("honour"))
    return "awards";
  if (text.includes("cricket") || text.includes("olympic") || text.includes("sport") || text.includes("medal"))
    return "sports";
  if (text.includes("appointed") || text.includes("chief") || text.includes("governor") || text.includes("director"))
    return "appointments";
  if (text.includes("un ") || text.includes("nato") || text.includes("bilateral") || text.includes("foreign"))
    return "international";
  if (text.includes("scheme") || text.includes("ministry") || text.includes("government") || text.includes("budget"))
    return "government";
  return "general";
}

function getExamRelevance(category: NewsCategory, title: string): "high" | "medium" | "low" {
  const highRelevanceCategories: NewsCategory[] = ["banking", "economy", "government", "appointments"];
  const highKeywords = ["rbi", "rate", "policy", "budget", "scheme", "appointed", "governor", "minister"];
  const titleLower = title.toLowerCase();

  if (highRelevanceCategories.includes(category) || highKeywords.some((k) => titleLower.includes(k))) return "high";
  if (["international", "science-tech", "awards"].includes(category)) return "medium";
  return "low";
}

export async function fetchLatestNews(category?: NewsCategory, pageSize = 20): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    throw new Error("NEWS_API_KEY not configured");
  }

  const query = category ? CATEGORY_QUERIES[category] : "India current affairs economy banking government";
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);
  const from = fromDate.toISOString().split("T")[0];

  const params = new URLSearchParams({
    q: query,
    language: "en",
    sortBy: "publishedAt",
    pageSize: String(pageSize),
    from,
    apiKey: NEWS_API_KEY,
  });

  const res = await fetch(`${BASE_URL}/everything?${params}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to fetch news");
  }

  const data = await res.json();

  return (data.articles || [])
    .filter((a: any) => a.title && a.title !== "[Removed]" && a.description)
    .map((article: any, idx: number) => {
      const cat = category || mapToCategory(article.title, article.description || "");
      return {
        id: `${Date.now()}-${idx}`,
        title: article.title,
        description: article.description || "",
        content: article.content || article.description || "",
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          id: article.source?.id || null,
          name: article.source?.name || "Unknown",
        },
        category: cat,
        examRelevance: getExamRelevance(cat, article.title),
      } as NewsArticle;
    });
}

export async function fetchTopHeadlines(pageSize = 10): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) throw new Error("NEWS_API_KEY not configured");

  const params = new URLSearchParams({
    country: "in",
    pageSize: String(pageSize),
    apiKey: NEWS_API_KEY,
  });

  const res = await fetch(`${BASE_URL}/top-headlines?${params}`, {
    next: { revalidate: 1800 },
  });

  if (!res.ok) throw new Error("Failed to fetch headlines");

  const data = await res.json();
  return (data.articles || [])
    .filter((a: any) => a.title && a.title !== "[Removed]")
    .map((article: any, idx: number) => {
      const cat = mapToCategory(article.title, article.description || "");
      return {
        id: `hl-${Date.now()}-${idx}`,
        title: article.title,
        description: article.description || "",
        content: article.content || article.description || "",
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: { id: article.source?.id || null, name: article.source?.name || "Unknown" },
        category: cat,
        examRelevance: getExamRelevance(cat, article.title),
      } as NewsArticle;
    });
}
