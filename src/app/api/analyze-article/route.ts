import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { generateArticleKeyPoints, generateQuizFromArticles } from "@/lib/groq";
import { NewsArticle } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { article } = await req.json() as { article: NewsArticle };

    if (!article || !article.title) {
      return NextResponse.json({ error: "Invalid article data provided." }, { status: 400 });
    }

    // Run both AI tasks in parallel, but catch errors individually so one failure doesn't crash the other
    const [keyPoints, quiz] = await Promise.all([
      generateArticleKeyPoints(article).catch(e => {
        console.error("Key Points Error:", e);
        return ["Could not extract key points at this time."];
      }),
      generateQuizFromArticles([article], 10, "medium", "day", "Banking").catch(e => {
        console.error("Quiz Gen Error:", e);
        return []; // Return empty quiz if it fails
      })
    ]);

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
