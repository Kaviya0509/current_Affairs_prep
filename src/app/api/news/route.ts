// src/app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { fetchLatestNews } from "@/lib/news";
import { NewsCategory } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as NewsCategory | null;
  const count = parseInt(searchParams.get("count") || "20");
  const period = (searchParams.get("period") || "week") as "day" | "week" | "month";

  try {
    const articles = await fetchLatestNews(category || undefined, count, period);
    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error("News API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
