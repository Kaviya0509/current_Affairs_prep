import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { generateQuizFromArticles } from "@/lib/groq";
import { NewsArticle } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { articles, period } = await req.json() as { articles: NewsArticle[], period?: string };

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: "No articles provided for test generation." }, { status: 400 });
    }

    // Generate 50 questions across the provided articles
    // Note: The generateQuizFromArticles function now handles batching internally to avoid token limits
    const quiz = await generateQuizFromArticles(articles, 50, "medium", period || "week", "Banking");

    if (!quiz || quiz.length === 0) {
      throw new Error("Failed to generate quiz questions.");
    }

    return NextResponse.json({ quiz });
  } catch (error: any) {
    console.error("Full Quiz API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate mock test" }, { status: 500 });
  }
}
