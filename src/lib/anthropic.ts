// src/lib/anthropic.ts
import Groq from "groq-sdk";
import { NewsArticle, QuizQuestion, CurrentAffairsDigest, NewsCategory } from "@/types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateQuizFromArticles(
  articles: NewsArticle[],
  count = 5,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<QuizQuestion[]> {
  const articleSummaries = articles
    .slice(0, 10)
    .map(
      (a, i) =>
        `${i + 1}. [${a.category.toUpperCase()}] ${a.title}\n   ${a.description}`
    )
    .join("\n\n");

  const prompt = `You are an expert bank exam (IBPS, SBI, RRB) current affairs question setter.

Based on these recent news articles, generate exactly ${count} multiple choice questions at ${difficulty} difficulty level.

NEWS ARTICLES:
${articleSummaries}

Generate questions that are commonly asked in bank exams. Focus on:
- Specific facts (dates, numbers, names, organizations)
- Policy changes and their implications
- International rankings and India's position
- Key appointments in banking/government
- RBI decisions and economic data

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "id": "q1",
    "question": "question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "detailed explanation of why this answer is correct",
    "category": "banking|economy|government|international|science-tech|awards|sports|appointments|general",
    "difficulty": "${difficulty}",
    "source": "article title or source"
  }
]

Important: correctAnswer is the 0-based index of the correct option.`;

  const response = await client.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const questions = JSON.parse(cleaned);
    return questions.map((q: any, idx: number) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`,
    }));
  } catch {
    throw new Error("Failed to parse quiz questions from AI response");
  }
}

export async function generateCurrentAffairsDigest(
  articles: NewsArticle[]
): Promise<CurrentAffairsDigest> {
  const articleList = articles
    .slice(0, 15)
    .map((a) => `- [${a.category}] ${a.title}: ${a.description}`)
    .join("\n");

  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are an expert current affairs analyst for bank exam preparation (IBPS, SBI PO, RRB, UPSC).

Analyze these recent Indian news articles and create a structured daily digest optimized for bank exam preparation.

ARTICLES:
${articleList}

Return ONLY valid JSON (no markdown):
{
  "date": "${today}",
  "summary": "2-3 sentence overview of today's most important current affairs",
  "topStories": [
    {
      "headline": "concise headline",
      "detail": "key facts in 2-3 sentences",
      "importance": "critical|important|informational",
      "examAngle": "why this matters for bank exams"
    }
  ],
  "bankingUpdates": ["key banking/RBI update 1", "key banking update 2"],
  "economyHighlights": ["economic data point 1", "economic highlight 2"],
  "internationalNews": ["India's international development 1", "India's international development 2"],
  "appointments": ["Name appointed as Position, Organization"],
  "awardsRecognitions": ["Award/recognition detail"]
}

Include 3-5 topStories, 2-4 items in each array. Focus on facts that appear in bank exam questions.`;

  const response = await client.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as CurrentAffairsDigest;
  } catch {
    throw new Error("Failed to parse digest from AI response");
  }
}

export async function generateArticleKeyPoints(article: NewsArticle): Promise<string[]> {
  const prompt = `Extract 4-5 key exam-relevant bullet points from this news article for bank exam (IBPS/SBI/RRB) preparation.

Title: ${article.title}
Content: ${article.description} ${article.content}

Return ONLY a JSON array of strings, each point under 20 words:
["point 1", "point 2", "point 3", "point 4"]

Focus on: specific facts, dates, numbers, organization names, policy names.`;

  const response = await client.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content || "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return ["Key points could not be extracted."];
  }
}

export async function askCurrentAffairsQuestion(
  question: string,
  context?: string
): Promise<string> {
  const systemPrompt = `You are an expert current affairs tutor for Indian bank exams (IBPS PO/Clerk, SBI PO/Clerk, RRB, RBI Grade B). 
Answer questions concisely and accurately. Focus on facts relevant to bank exams. 
If the question is about recent events you're unsure about, mention that the student should verify with latest sources.`;

  const response = await client.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: context
          ? `Context: ${context}\n\nQuestion: ${question}`
          : question,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}
