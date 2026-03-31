import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { callGroqAPI } from "@/lib/groq";
import { fetchLatestNews } from "@/lib/news";
import { NewsArticle } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // Check if user is asking for a specific date (e.g. "March 28")
    const dateMentioned = /([A-Za-z]+)\s+(\d+)/.test(message) || /today|yesterday/i.test(message);
    
    // Fetch news based on whether a specific date/past period might be needed
    const fetchPeriod = dateMentioned ? "month" : "day";
    const articles = await fetchLatestNews(undefined, 50, fetchPeriod as any);

    const context = articles
      .map((a: NewsArticle, i: number) => {
        const dateStr = new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        return `${i + 1}. [${dateStr}] [${a.category.toUpperCase()}] ${a.title}: ${a.description}`;
      })
      .join("\n\n");

    const systemPrompt = `You are the BankPrep Intelligence AI Assistant. 
You are an expert in Indian Banking exams (IBPS, SBI, RBI, etc.).
Your job is to answer student queries about today's current affairs and provide strategic prep help.

TODAY'S INTELLIGENCE BRIEFINGS:
${context}

RULES:
1. Be concise but extremely high-yield for exams.
2. Use bullet points for important facts (dates, numbers, names).
3. If they ask about something not in today's news, provide general banking exam perspective if applicable.
4. Maintain a professional, executive tone.

QUIZ/QUESTION MODE:
- If asked for a "Banking Quiz", filter for articles mentioning banks, RBI, loans, and financial policy.
- If asked for an "Economy Quiz", filter for GDP, inflation, trade, and economic data.
- If asked for a "National Quiz", filter for government schemes, cabinet decisions, and ministry news.
- Generate 3 high-quality MCQs based ONLY on those relevant intelligence filings.
- Provide the correct answer and a brief strategic explanation for each question.
- Focus on the most complex or high-relevance topics from today.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message }
    ];

    const response = await callGroqAPI(messages, { type: "text" });

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Intelligence server is currently occupied." }, { status: 500 });
  }
}
