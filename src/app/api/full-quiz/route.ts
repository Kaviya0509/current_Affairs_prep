import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { generateQuizFromArticles } from "@/lib/groq";
import { NewsArticle } from "@/types";
import { scrapeArticleFullContent } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { articles, period } = await req.json() as { articles: NewsArticle[], period?: string };

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: "No articles provided for test generation." }, { status: 400 });
    }

    // DISTRIBUTED INTELLIGENCE: Sample 20 articles but deep-scrape only 10 strategic ones for optimal throughput
    const poolSize = 20;
    const samplingInterval = Math.max(1, Math.floor(articles.length / poolSize));
    const intelligenceBase = articles.filter((_, idx) => idx % samplingInterval === 0).slice(0, poolSize);

    const finalPool = await Promise.all(
      intelligenceBase.map(async (a, idx) => {
        // Deep-scrape only the first 10 sampled articles to keep the payload manageable
        if (idx < 10) {
          try {
            const full = await scrapeArticleFullContent(a.url);
            return { ...a, content: full || a.description };
          } catch (e) {
            console.warn("Dossier deep-scrape failed, using description:", e);
            return a;
          }
        }
        return a;
      })
    );

    // Generate 50 questions across the provided articles using the high-speed 8B model
    // This avoids rate-limiting on large 50-question batches while maintaining deep coverage.
    const quiz = await generateQuizFromArticles(
      finalPool, 
      50, 
      "medium", 
      period || "week", 
      "Banking",
      "llama-3.1-8b-instant"
    );

    if (!quiz || quiz.length === 0) {
      throw new Error("Failed to generate quiz questions.");
    }

    return NextResponse.json({ quiz });
  } catch (error: any) {
    console.error("Full Quiz API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate mock test" }, { status: 500 });
  }
}
