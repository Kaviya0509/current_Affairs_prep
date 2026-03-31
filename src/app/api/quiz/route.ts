// src/app/api/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { fetchLatestNews } from "@/lib/news";
import { generateQuizFromArticles } from "@/lib/groq";
import { NewsCategory } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as NewsCategory | null;
  const count = parseInt(searchParams.get("count") || "10");
  const difficulty = (searchParams.get("difficulty") || "medium") as "easy" | "medium" | "hard";
  const period = (searchParams.get("period") || "week") as "day" | "week" | "month";
  const exam = searchParams.get("exam") || "Banking";

  try {
    const articles = await fetchLatestNews(category || undefined, 30, period);
    const questions = await generateQuizFromArticles(articles, count, difficulty, period, exam);
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Quiz API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
