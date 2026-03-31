// src/lib/groq.ts
import { NewsArticle, QuizQuestion, CurrentAffairsDigest, AIAnalysisResponse } from "@/types";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Helper to call Groq Chat Completions API using native fetch.
 */
export async function callGroqAPI(
  messages: any[],
  responseFormat?: { type: string },
  modelOverride?: string
) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in .env.local");
  }

  const payload: any = {
    model: modelOverride || "llama-3.1-8b-instant",
    messages,
    temperature: 0.1,
    stream: false,
  };

  if (responseFormat && responseFormat.type === "json_object") {
    payload.response_format = responseFormat;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      // @ts-ignore — Next.js extended fetch option
      next: { revalidate: 0 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(
        error.error?.message || `Groq API Error: ${res.statusText}`
      );
    }

    const result = await res.json();
    const rawContent: string = result.choices?.[0]?.message?.content || "";

    // STRATEGIC CLEANSE: Remove common AI markdown wrapping that breaks JSON.parse
    return rawContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
  } catch (err: any) {
    if (err.name === "AbortError")
      throw new Error("Brain Node Timeout: AI took too long to respond.");
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateQuizFromArticles(
  articles: NewsArticle[],
  count = 5,
  difficulty: "easy" | "medium" | "hard" = "medium",
  period = "week",
  exam = "Banking",
  model = "llama-3.1-8b-instant"
): Promise<QuizQuestion[]> {
  // REDUCED: Stay within 6k TPM limits by processing 5 vectors at once
  const batchSize = 5;
  const numBatches = Math.ceil(count / batchSize);

  const generateBatch = async (
    batchCount: number,
    articleSlice: NewsArticle[]
  ): Promise<any[]> => {
    // TRUNCATE: Drastically reduce content length to bypass TPM limits
    const articleList = articleSlice
      .map(
        (a, i) =>
          `${i + 1}. [${a.category.toUpperCase()}] ${a.title}\n   ${(
            a.content ||
            a.description ||
            ""
          ).substring(0, 800)}`
      )
      .join("\n\n");

    const prompt = `Generate exactly ${batchCount} strategic MCQs for Bank preparations:
ARTICLES:
${articleList}

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "analysis",
      "category": "banking",
      "difficulty": "${difficulty}"
    }
  ]
}`;

    const content = await callGroqAPI(
      [{ role: "user", content: prompt }],
      { type: "json_object" },
      model
    );

    try {
      // PHASE 1: Attempt standard JSON parsing
      const data = JSON.parse(content);
      const questionsArray: any[] = Array.isArray(data)
        ? data
        : data.questions ||
        data.quiz ||
        data.assessment ||
        (Object.values(data).find((v) => Array.isArray(v)) as any[]) ||
        [];

      if (Array.isArray(questionsArray) && questionsArray.length > 0)
        return questionsArray;
    } catch (e) {
      console.warn(
        "Standard JSON Parsing failed, attempting Strategic Vector Recovery..."
      );
    }

    // PHASE 2: STRATEGIC RECOVERY — Extract valid question objects from truncated/malformed text
    try {
      const questions: any[] = [];
      const questionRegex =
        /\{[\s\S]*?"question"[\s\S]*?"options"[\s\S]*?"correctAnswer"[\s\S]*?\}/g;
      const matches = content.match(questionRegex);

      if (matches) {
        for (const m of matches) {
          try {
            let candidate = m.trim();
            if (!candidate.endsWith("}")) candidate += "}";
            const q = JSON.parse(candidate);
            if (q.question && q.options) questions.push(q);
          } catch (_err) {
            /* Skip individual malformed fragments */
          }
        }
      }
      return questions;
    } catch (err) {
      console.error("Critical Assessment Decypher Failure:", err);
      return [];
    }
  };

  const allQuestions: any[] = [];

  for (let i = 0; i < numBatches; i++) {
    const needed = Math.min(batchSize, count - allQuestions.length);
    if (needed <= 0) break;

    const start = (i * 8) % articles.length;
    const slice = articles.slice(start, start + 12);

    // RESILIENCE UPGRADE: Catch individual batch failures so the whole test doesn't crash
    try {
      const batchResult = await generateBatch(needed, slice);
      if (batchResult && batchResult.length > 0) {
        allQuestions.push(...batchResult);
      }
    } catch (e) {
      console.warn(
        `Strategic Batch ${i + 1} failed to initialize, continuing...`,
        e
      );
    }

    if (i < numBatches - 1) {
      // INCREASED: 2.5s for maximum TPM & RPM stability
      await new Promise((r) => setTimeout(r, 2500));
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
    .slice(0, 40)
    .map((a, i) => `${i + 1}. ${a.title}: ${a.description}`)
    .join("\n");
  const today = new Date().toLocaleDateString();

  const prompt = `Generate a high-level BankPrep Intelligence Digest.
ARTICLES:
${articleList}

Return ONLY valid JSON:
{
  "date": "${today}",
  "summary": "strategic overview",
  "topStories": [{ "headline": "text", "detail": "text", "importance": "critical", "examAngle": "text" }],
  "bankingUpdates": ["text 1"],
  "economyHighlights": ["text 1"],
  "internationalNews": ["text 1"],
  "appointments": ["text 1"],
  "awardsRecognitions": ["text 1"]
}`;

  const content = await callGroqAPI(
    [{ role: "user", content: prompt }],
    { type: "json_object" }
  );
  return JSON.parse(content) as CurrentAffairsDigest;
}

export async function generateArticleKeyPoints(
  article: NewsArticle
): Promise<string[]> {
  const prompt = `Extract 4-5 key exam-relevant bullet points.
Title: ${article.title}
Content: ${article.content || article.description}

Return ONLY valid JSON: { "points": ["point 1", "point 2", "point 3"] }`;

  const content = await callGroqAPI(
    [{ role: "user", content: prompt }],
    { type: "json_object" }
  );
  try {
    const data = JSON.parse(content);
    return data.points || [];
  } catch {
    return ["Could not extract points."];
  }
}

export async function askCurrentAffairsQuestion(
  question: string,
  context?: string
): Promise<string> {
  const content = await callGroqAPI([
    { role: "system", content: "You are an expert tutor. Answer concisely." },
    {
      role: "user",
      content: context
        ? `Context: ${context}\n\nQuestion: ${question}`
        : question,
    },
  ]);
  return content;
}

/**
 * STRATEGIC ANALYSIS VECTOR: Analyzes user queries for the Chat interface
 */
export async function analyzeUserQuery(query: string): Promise<string> {
  const prompt = `System: Expert BankPrep Intelligence Assistant.
Analytic Requirement: Dissect the user's inquiry about current affairs or banking exams.
Inquiry: ${query}

Response Directive: Provide an executive summary with high-yield pointers. Keep the tone professional and strategic.`;

  return await callGroqAPI([{ role: "user", content: prompt }]);
}