import Parser from "rss-parser";
import { NewsArticle, NewsCategory } from "@/types";

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'category'],
  },
});

/** Strip HTML tags and decode entities for plain-text summary */
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function mapToCategory(title: string, description: string): NewsCategory {
  const text = (title + " " + description).toLowerCase();
  
  if (text.includes("rbi") || text.includes("bank") || text.includes("loan") || text.includes("credit"))
    return "banking";
  if (text.includes("gdp") || text.includes("inflation") || text.includes("economy") || text.includes("rupee") || text.includes("fiscal"))
    return "economy";
    
  // Fixed 'ai' matching parts of words like 'affairs' or 'said'
  if (text.includes("isro") || text.includes("tech") || /\bai\b/.test(text) || text.includes("satellite") || text.includes("science"))
    return "science-tech";
    
  if (text.includes("award") || text.includes("padma") || text.includes("prize") || text.includes("honour") || text.includes("medal"))
    return "awards";
  if (text.includes("cricket") || text.includes("olympic") || text.includes("sport") || text.includes("championship"))
    return "sports";
  if (text.includes("appointed") || text.includes("chief") || text.includes("governor") || text.includes("director") || text.includes("ambassador"))
    return "appointments";
    
  // Fixed 'un ' to \bun\b so it doesn't arbitrarily match 'under'
  if (/\bun\b/.test(text) || text.includes("nato") || text.includes("bilateral") || text.includes("foreign") || text.includes("international"))
    return "international";
    
  if (text.includes("scheme") || text.includes("ministry") || text.includes("government") || text.includes("budget") || text.includes("cabinet"))
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

/**
 * Fetches premium test-prep intelligence quietly from RSS feeds, fully white-labeled.
 */
export async function fetchPrivateIntelligenceFeed(): Promise<NewsArticle[]> {
  const feeds = [
    { url: "https://affairscloud.com/feed/", source: "BankPrep Intelligence" },
  ];

  try {
    const results = await Promise.allSettled(
      feeds.map(async ({ url, source }) => {
        const feed = await parser.parseURL(url);
        return feed.items.map((item: any, idx: number) => {
          let title = item.title || "";
          // STRIP any signature strings matching AffairsCloud
          title = title.replace(/affairs\s*cloud/gi, "BankPrep").trim();

          // Prefer full HTML content
          let rawHtml: string = item['content:encoded'] || item.content || item.description || "";
          
          // Scrub HTML content
          rawHtml = rawHtml.replace(/affairs\s*cloud/gi, "BankPrep");
          const fullContent = rawHtml;
          
          // Plain-text summary stripped of tags
          const description = rawHtml ? stripHtml(rawHtml).slice(0, 400) : (item.contentSnippet || "");

          // Category from RSS tags or keyword mapping
          const rssCategory = Array.isArray(item.categories)
            ? item.categories[0]
            : (item.category || "");
            
          const cat = mapToCategory(title, description + " " + rssCategory);

          return {
            id: `BankPrep-${Date.now()}-${idx}`,
            title,
            description,
            content: fullContent,
            url: item.link || "",
            urlToImage: null,
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            source: { id: null, name: source },
            category: cat,
            examRelevance: getExamRelevance(cat, title),
          } as NewsArticle;
        });
      })
    );

    const articles: NewsArticle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") articles.push(...result.value);
    }

    // Return descending
    return articles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error("Private Feed Fetch Error:", error);
    return [];
  }
}

export async function fetchLatestNews(
  category?: NewsCategory,
  pageSize = 40,
  period: "day" | "week" | "month" = "week"
): Promise<NewsArticle[]> {
  
  // 1. Fetch raw premium payload
  const rssArticles = await fetchPrivateIntelligenceFeed();
  
  // 2. Filter by category
  let primaryArticles = category && (category as string) !== "all" 
    ? rssArticles.filter(a => a.category === category)
    : rssArticles;

  // 3. Filter by period strictly
  const now = new Date();
  primaryArticles = primaryArticles.filter((article) => {
    const pubDate = new Date(article.publishedAt);
    const diffTime = Math.abs(now.getTime() - pubDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (period === "day") return diffDays <= 2; // pad Day slightly for RSS delays
    if (period === "week") return diffDays <= 7;
    if (period === "month") return diffDays <= 30;
    return true;
  });

  return primaryArticles.slice(0, pageSize);
}

export async function fetchTopHeadlines(pageSize = 10): Promise<NewsArticle[]> {
  const rssArticles = await fetchPrivateIntelligenceFeed();
  return rssArticles.slice(0, pageSize);
}
