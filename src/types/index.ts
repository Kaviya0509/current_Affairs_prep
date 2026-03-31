// src/types/index.ts

export type NewsCategory =
  | "banking"
  | "economy"
  | "government"
  | "international"
  | "science-tech"
  | "awards"
  | "sports"
  | "appointments"
  | "general";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  category: NewsCategory;
  examRelevance: "high" | "medium" | "low";
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: NewsCategory;
  difficulty: "easy" | "medium" | "hard";
  source?: string;
}

export interface CurrentAffairsDigest {
  date: string;
  summary: string;
  topStories: Array<{
    headline: string;
    detail: string;
    importance: "critical" | "important" | "informational";
    examAngle: string;
  }>;
  bankingUpdates: string[];
  economyHighlights: string[];
  internationalNews: string[];
  appointments: string[];
  awardsRecognitions: string[];
}
export interface AIAnalysisResponse {
  summary: string;
  keyPoints: string[];
  implications: string;
  references: string[];
}
