import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { generateArticleKeyPoints, generateQuizFromArticles } from "@/lib/groq";
import { NewsArticle } from "@/types";
import { scrapeArticleFullContent } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { article } = await req.json() as { article: NewsArticle };

    if (!article || !article.title) {
      return NextResponse.json({ error: "Invalid article data provided." }, { status: 400 });
    }

    // UPGRADE: Scrape content but handle network failures gracefully
    let finalContent = article.description || article.content || "";
    try {
      const fullContent = await scrapeArticleFullContent(article.url);
      if (fullContent && fullContent.length > finalContent.length) {
        finalContent = fullContent;
      }
    } catch (e) {
      console.warn("Deep Scrape Failed - Falling back to dossier description:", e);
    }
    article.content = finalContent;

    // Run AI tasks sequentially to stabilize the intelligence line and avoid rate limits (RPM spikes)
    const keyPoints = await generateArticleKeyPoints(article).catch(e => {
      console.error("Key Points Error:", e);
      return ["Could not extract key points at this time."];
    });

    // BUFFER: Wait 1500ms between calls to avoid RPM saturation
    await new Promise(r => setTimeout(r, 1500));

    const quiz = await generateQuizFromArticles([article], 20, "medium", "day", "Banking").catch(e => {
      console.error("Quiz Gen Error:", e);
      return []; // Return empty quiz if it fails
    });

    // If both failed completely
    if (keyPoints.length === 1 && keyPoints[0].includes("Could not") && quiz.length === 0) {
      throw new Error("AI Engine failed to generate intelligence. The article might be too complex or rate limits were hit.");
    }

    return NextResponse.json({ keyPoints, quiz });
  } catch (error: any) {
    console.error("Analyze Article Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze article" }, { status: 500 });
  }
}
