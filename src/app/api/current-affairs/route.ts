// src/app/api/current-affairs/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { fetchLatestNews } from "@/lib/news";
import { generateCurrentAffairsDigest } from "@/lib/groq";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") || "day") as "day" | "week" | "month";

    // Period mapping: day=24h, week=7d, month=30d
    // In NewsAPI, there's a 'from' parameter.
    const pageSize = period === "month" ? 100 : period === "week" ? 60 : 25;
    const articles = await fetchLatestNews(undefined, pageSize, period);
    console.log(`[NEWS] Found ${articles.length} articles for period: ${period}`);

    if (articles.length === 0) {
      return NextResponse.json({ 
        articles: [], 
        digest: {
          date: new Date().toISOString().split("T")[0],
          summary: "Insufficient data available for this period to generate a strategic briefing.",
          topStories: [],
          bankingUpdates: [],
          economyHighlights: [],
          internationalNews: [],
          appointments: [],
          awardsRecognitions: []
        }
      });
    }

    const digest = await generateCurrentAffairsDigest(articles, period as any);
    
    return NextResponse.json({ articles, digest });
  } catch (error: any) {
    console.error(`Current Affairs API (${req.url}) Error:`, {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return NextResponse.json({ 
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined 
    }, { status: 500 });
  }
}
