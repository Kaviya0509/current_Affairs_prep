"use client";
// src/app/quiz/page.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { QuizQuestion, NewsCategory } from "@/types";
import { QuizSkeleton } from "@/components/ui/Skeleton";
import {
  Brain,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  Trophy,
  AlertCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn, CATEGORY_LABELS } from "@/lib/utils";

const ALL_CATEGORIES: NewsCategory[] = [
  "economy", "banking", "government", "international",
  "science-tech", "awards", "sports", "appointments", "general",
];

type Phase = "setup" | "loading" | "quiz" | "result";

export default function QuizPage() {
  const searchParams = useSearchParams();
  const preCategory = searchParams.get("category") as NewsCategory | null;

  const [phase, setPhase] = useState<Phase>(preCategory ? "loading" : "setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // Setup form state
  const [category, setCategory] = useState<NewsCategory | "all">(preCategory || "all");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (preCategory) generateQuiz(preCategory, "medium", 5);
  }, []);

  async function generateQuiz(cat?: NewsCategory | "all", diff?: string, cnt?: number) {
    setPhase("loading");
    setError(null);
    setAnswers({});
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: (cat || category) === "all" ? undefined : cat || category,
          difficulty: diff || difficulty,
          count: cnt || count,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setQuestions(data.questions);
      setPhase("quiz");
    } catch (e: any) {
      setError(e.message);
      setPhase("setup");
    }
  }

  function handleSelect(optionIdx: number) {
    if (revealed) return;
    setSelected(optionIdx);
    setRevealed(true);
    const q = questions[current];
    const newAnswers = { ...answers, [q.id]: optionIdx };
    setAnswers(newAnswers);
    if (optionIdx === q.correctAnswer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  const q = questions[current];
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // === SETUP PHASE ===
  if (phase === "setup") {
    return (
      <div className="max-w-xl mx-auto animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
            <Brain size={28} className="text-navy-950" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Practice Quiz</h1>
          <p className="text-navy-400 text-sm mt-2">
            AI-generated questions from today's real news articles
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-crimson-600/10 border border-crimson-600/20 text-crimson-400 text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-navy-200 block mb-2">Topic Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NewsCategory | "all")}
              className="w-full px-3 py-2.5 rounded-xl glass-card border border-navy-700/50 text-white text-sm focus:outline-none focus:border-navy-500 bg-navy-900"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-sm font-medium text-navy-200 block mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium capitalize transition-all border",
                    difficulty === d
                      ? d === "easy"
                        ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-300"
                        : d === "medium"
                        ? "bg-gold-900/30 border-gold-600/50 text-gold-300"
                        : "bg-crimson-600/20 border-crimson-500/50 text-crimson-300"
                      : "glass-card border-transparent text-navy-400 hover:text-white"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-sm font-medium text-navy-200 block mb-2">
              Number of Questions: <span className="text-gold-400">{count}</span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-yellow-400"
            />
            <div className="flex justify-between text-xs text-navy-500 mt-1">
              <span>3</span><span>10</span>
            </div>
          </div>

          <button
            onClick={() => generateQuiz()}
            className="w-full py-3 bg-gradient-gold text-navy-950 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Generate Quiz from Today's News
          </button>
        </div>
      </div>
    );
  }

  // === LOADING PHASE ===
  if (phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-gold-400 text-sm animate-pulse">
            <Sparkles size={14} />
            AI is reading today's news and creating questions...
          </div>
        </div>
        <QuizSkeleton />
      </div>
    );
  }

  // === RESULT PHASE ===
  if (phase === "result") {
    return (
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-6">
            <Trophy size={32} className="text-navy-950" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white">Quiz Complete!</h2>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4">
              <p className="text-3xl font-display font-bold text-gold-400">{score}/{questions.length}</p>
              <p className="text-xs text-navy-400 mt-1">Correct</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className={cn("text-3xl font-display font-bold",
                percentage >= 80 ? "text-emerald-400" : percentage >= 50 ? "text-gold-400" : "text-crimson-400"
              )}>
                {percentage}%
              </p>
              <p className="text-xs text-navy-400 mt-1">Score</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-3xl font-display font-bold text-blue-400">{questions.length}</p>
              <p className="text-xs text-navy-400 mt-1">Questions</p>
            </div>
          </div>

          <p className="text-navy-300 text-sm mt-4">
            {percentage >= 80
              ? "🎉 Excellent! You're well prepared."
              : percentage >= 50
              ? "👍 Good effort! Keep practicing."
              : "📚 Keep studying! Review the digest daily."}
          </p>

          {/* Review answers */}
          <div className="mt-6 text-left space-y-3">
            <h3 className="font-medium text-white text-sm">Review Answers:</h3>
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const correct = userAns === q.correctAnswer;
              return (
                <div key={q.id} className={cn("p-3 rounded-xl border text-xs",
                  correct ? "border-emerald-500/30 bg-emerald-600/10" : "border-crimson-500/30 bg-crimson-600/10"
                )}>
                  <p className="text-navy-200 mb-1">{i + 1}. {q.question}</p>
                  <p className={cn("font-medium", correct ? "text-emerald-400" : "text-crimson-400")}>
                    {correct ? "✓" : "✗"} Your answer: {q.options[userAns]}
                  </p>
                  {!correct && (
                    <p className="text-emerald-400">Correct: {q.options[q.correctAnswer]}</p>
                  )}
                  <p className="text-navy-400 mt-1 italic">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => generateQuiz()}
              className="flex-1 py-2.5 bg-gradient-gold text-navy-950 font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> New Quiz
            </button>
            <button
              onClick={() => setPhase("setup")}
              className="flex-1 py-2.5 glass-card border border-navy-700 text-navy-300 hover:text-white rounded-xl text-sm transition-colors"
            >
              Change Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === QUIZ PHASE ===
  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-navy-400 mb-2">
          <span>Question {current + 1} of {questions.length}</span>
          <span className="flex items-center gap-1 text-gold-400">
            <Clock size={12} />
            Score: {score}/{current + (revealed ? 1 : 0)}
          </span>
        </div>
        <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all duration-500"
            style={{ width: `${((current + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        {/* Category + Difficulty */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-navy-300">
            {CATEGORY_LABELS[q.category]}
          </span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full",
            q.difficulty === "easy" ? "bg-emerald-600/20 text-emerald-400" :
            q.difficulty === "medium" ? "bg-gold-900/30 text-gold-400" :
            "bg-crimson-600/20 text-crimson-400"
          )}>
            {q.difficulty}
          </span>
          {q.source && (
            <span className="text-xs text-navy-500 truncate">📰 {q.source}</span>
          )}
        </div>

        {/* Question */}
        <h2 className="font-display font-semibold text-white text-lg leading-snug">
          {q.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === q.correctAnswer;
            let optClass = "glass-card border border-transparent text-navy-200 hover:border-navy-600 hover:text-white";

            if (revealed) {
              if (isCorrect) optClass = "bg-emerald-600/20 border border-emerald-500/50 text-emerald-300";
              else if (isSelected && !isCorrect) optClass = "bg-crimson-600/20 border border-crimson-500/50 text-crimson-300";
              else optClass = "glass-card border border-navy-800/30 text-navy-500";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                className={cn(
                  "quiz-option w-full text-left px-4 py-3.5 rounded-xl text-sm flex items-center gap-3 transition-all",
                  optClass,
                  !revealed && "cursor-pointer"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold",
                  revealed && isCorrect ? "border-emerald-500 bg-emerald-600/30 text-emerald-300" :
                  revealed && isSelected ? "border-crimson-500 bg-crimson-600/30 text-crimson-300" :
                  "border-navy-600 text-navy-500"
                )}>
                  {revealed && isCorrect ? <CheckCircle2 size={14} /> :
                   revealed && isSelected && !isCorrect ? <XCircle size={14} /> :
                   String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && (
          <div className="p-4 rounded-xl bg-navy-800/50 border border-navy-700/50 animate-fade-up">
            <p className="text-xs font-semibold text-gold-400 mb-1">💡 Explanation</p>
            <p className="text-navy-200 text-sm leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {/* Next button */}
        {revealed && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-gradient-gold text-navy-950 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 animate-fade-up"
          >
            {current + 1 >= questions.length ? (
              <><Trophy size={16} /> See Results</>
            ) : (
              <>Next Question <ChevronRight size={16} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
