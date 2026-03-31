// src/lib/groq.ts
import { NewsArticle, QuizQuestion, CurrentAffairsDigest, AIAnalysisResponse } from "@/types";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Helper to call Groq Chat Completions API using native fetch.
 * This removes dependency on groq-sdk, fixing module resolution errors.
 */
export async function callGroqAPI(messages: any[], responseFormat?: { type: string }) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env.local");
  }

  const payload: any = {
    model: "llama-3.1-8b-instant",
    messages,
    temperature: 0.1,
    stream: false,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(error.error?.message || `Groq API Error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function generateQuizFromArticles(
  articles: NewsArticle[],
  count = 5,
  difficulty: "easy" | "medium" | "hard" = "medium",
  period = "week",
  exam = "Banking"
): Promise<QuizQuestion[]> {
  // To handle large counts (like 50), we split into batches to avoid token limits
  // We run them sequentially with a small delay to respect Groq rate limits (RPM/TPM)
  const batchSize = 25; 
  const numBatches = Math.ceil(count / batchSize);
  
  const generateBatch = async (batchCount: number, articleSlice: NewsArticle[]) => {
    const articleSummaries = articleSlice
      .map((a, i) => `${i + 1}. [${a.category.toUpperCase()}] ${a.title}\n   ${a.description}`)
      .join("\n\n");

    const prompt = `You are an expert ${exam} exam current affairs question setter.
Generate a high-quality mock test batch of exactly ${batchCount} MCQs from the given BankPrep data.

FORMAT:
- Exactly ${batchCount} MCQs
- Difficulty: ${difficulty}
- Include answers + detailed explanations
- Focus on FACTS, DATES, NAMES, and AMOUNTS.

INPUT:
${articleSummaries}

Return ONLY valid JSON in this exact structure:
{
  "questions": [
    {
      "question": "text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "detailed analysis",
      "category": "banking|economy|government|general",
      "difficulty": "${difficulty}",
      "source": "BankPrep Intelligence"
    }
  ]
}`;

    const content = await callGroqAPI(
      [{ role: "user", content: prompt }],
      { type: "json_object" }
    );

    try {
      const data = JSON.parse(content);
      const qs = data.questions || Object.values(data)[0] || [];
      return Array.isArray(qs) ? qs : [];
    } catch (e) {
      console.error("Batch Parse Error:", e);
      return [];
    }
  };

  const allQuestions: any[] = [];
  for (let i = 0; i < numBatches; i++) {
    const needed = Math.min(batchSize, count - allQuestions.length);
    if (needed <= 0) break;

    // Shift articles so each batch sees different intelligence
    const start = (i * 8) % articles.length;
    const slice = articles.slice(start, start + 12);
    
    const batchResult = await generateBatch(needed, slice);
    allQuestions.push(...batchResult);

    // Small sequential delay to stabilize the intelligence line
    if (i < numBatches - 1) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  return allQuestions.slice(0, count).map((q: any, idx: number) => ({
    ...q,
    id: `q-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
  }));
}

export async function generateCurrentAffairsDigest(
  articles: NewsArticle[],
  period: "day" | "week" | "month" = "day"
): Promise<CurrentAffairsDigest> {
  const articleList = articles
    .slice(0, 15)
    .map((a) => `- [${a.category}] ${a.title}: ${a.description}`)
    .join("\n");

  const today = new Date().toISOString().split("T")[0];
  const periodLabel = period === "day" ? "Daily" : period === "week" ? "Weekly" : "Monthly";

  const prompt = `Analyze these recent Indian news articles and create a structured ${periodLabel} digest for bank exam preparation.

ARTICLES:
${articleList}

Return ONLY valid JSON:
{
  "date": "${today}",
  "summary": "overview of the ${periodLabel.toLowerCase()} current affairs",
  "topStories": [
    {
      "headline": "headline",
      "detail": "detail",
      "importance": "critical|important|informational",
      "examAngle": "why it matters"
    }
  ],
  "bankingUpdates": ["string 1", "string 2"],
  "economyHighlights": ["string 1", "string 2"],
  "internationalNews": ["string 1", "string 2"],
  "appointments": ["string 1", "string 2"],
  "awardsRecognitions": ["string 1", "string 2"]
}

CRITICAL: bankingUpdates, economyHighlights, internationalNews, appointments, and awardsRecognitions MUST be arrays of SIMPLE STRINGS, not objects.`;

  const content = await callGroqAPI(
    [{ role: "user", content: prompt }],
    { type: "json_object" }
  );

  const digest = JSON.parse(content);

  // Normalization to prevent React child errors if AI returns objects instead of strings
  const normalize = (arr: any) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.update || item.detail || item.text || JSON.stringify(item);
      }
      return String(item);
    });
  };

  return {
    ...digest,
    bankingUpdates: normalize(digest.bankingUpdates),
    economyHighlights: normalize(digest.economyHighlights),
    internationalNews: normalize(digest.internationalNews),
    appointments: normalize(digest.appointments),
    awardsRecognitions: normalize(digest.awardsRecognitions),
  } as CurrentAffairsDigest;
}

export async function generateArticleKeyPoints(article: NewsArticle): Promise<string[]> {
  const prompt = `Extract 4-5 key exam-relevant bullet points from this news article.
Title: ${article.title}
Content: ${article.content || article.description}

Return ONLY valid JSON in this exact structure:
{
  "points": ["point 1", "point 2", "point 3"]
}`;

  const content = await callGroqAPI(
    [{ role: "user", content: prompt }],
    { type: "json_object" }
  );

  try {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : data.points || [];
  } catch {
    return ["Could not extract key points."];
  }
}

export async function analyzeUserQuery(query: string): Promise<AIAnalysisResponse> {
  const prompt = `You are a high-level current affairs analyst for Indian bank exams.
Analyze the following interrogation query and provide a structured intelligence report.
Query: ${query}

Return ONLY valid JSON in this format:
{
  "summary": "one-sentence strategic overview",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "implications": "deep assessment of financial/regulatory impact",
  "references": ["BankPrep Intelligence", "RBI Bulletin", "Source X", ...]
}`;

  const content = await callGroqAPI(
    [{ role: "user", content: prompt }],
    { type: "json_object" }
  );

  return JSON.parse(content) as AIAnalysisResponse;
}

export async function askCurrentAffairsQuestion(
  question: string,
  context?: string
): Promise<string> {
  const content = await callGroqAPI([
    {
      role: "system",
      content: "You are an expert current affairs tutor for Indian bank exams. Answer concisely.",
    },
    {
      role: "user",
      content: context ? `Context: ${context}\n\nQuestion: ${question}` : question,
    },
  ]);

  return content;
}
