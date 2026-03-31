"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NewsArticle, NewsCategory, QuizQuestion } from "@/types";
import {
  Brain,
  Play,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
  ChevronRight,
  Forward,
} from "lucide-react";

import "./news.css";

const CARD_COLORS = [
  "#4ade80","#38bdf8","#a855f7","#f472b6","#fbbf24","#f87171","#2dd4bf","#818cf8",
];

const MODAL_ACCENTS = [
  { text: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10" },
  { text: "text-sky-400",     border: "border-sky-500/50",     bg: "bg-sky-500/10"     },
  { text: "text-purple-400",  border: "border-purple-500/50",  bg: "bg-purple-500/10"  },
  { text: "text-pink-400",    border: "border-pink-500/50",    bg: "bg-pink-500/10"    },
  { text: "text-amber-400",   border: "border-amber-500/50",   bg: "bg-amber-500/10"   },
];

function getCategoryDesign(cat: string) {
  const map: Record<string, any> = {
    economy:       { icon: "💹", class: "cat-economy", accent: "#4ade80" },
    banking:       { icon: "🏦", class: "cat-banking", accent: "#38bdf8" },
    government:    { icon: "🏛️", class: "cat-gov",    accent: "#a855f7" },
    international: { icon: "🌏", class: "cat-intl",   accent: "#f472b6" },
    "science-tech":{ icon: "🛸", class: "cat-sci",    accent: "#fbbf24" },
    awards:        { icon: "🥇", class: "cat-award",  accent: "#f87171" },
    sports:        { icon: "🏏", class: "cat-sport",  accent: "#2dd4bf" },
    appointments:  { icon: "👤", class: "cat-apt",    accent: "#818cf8" },
    general:       { icon: "📰", class: "cat-gen",    accent: "#94a3b8" },
  };
  const design = map[cat.toLowerCase()] || map.general;
  return { ...design, bg: `linear-gradient(135deg, ${design.accent}20, transparent)` };
}

/* ─────────────────────────── MAIN CONTENT ─────────────────────────── */
function NewsContent() {
  const searchParams = useSearchParams();

  const [articles,         setArticles]         = useState<NewsArticle[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);

  const [category,  setCategory]  = useState<NewsCategory | "all">("all");
  const [period,    setPeriod]    = useState<"day" | "week" | "month">("month");
  const [search,    setSearch]    = useState("");
  const [sort,      setSort]      = useState<"relevance" | "latest">("relevance");

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [analyzing,        setAnalyzing]        = useState(false);
  const [keyPoints,        setKeyPoints]        = useState<string[] | null>(null);
  const [quiz,             setQuiz]             = useState<QuizQuestion[] | null>(null);
  const [quizError,        setQuizError]        = useState<string | null>(null);
  const [userAnswers,      setUserAnswers]      = useState<Record<number, number>>({});
  const [showResults,      setShowResults]      = useState(false);
  const [currentQuizStep,  setCurrentQuizStep]  = useState(0);

  /* Full Test */
  const [showFullTestModal,    setShowFullTestModal]    = useState(false);
  const [fullQuiz,             setFullQuiz]             = useState<QuizQuestion[] | null>(null);
  const [analyzingFull,        setAnalyzingFull]        = useState(false);
  const [fullTestAnswers,      setFullTestAnswers]      = useState<Record<number, number>>({});
  const [showFullResults,      setShowFullResults]      = useState(false);
  const [fullTestError,        setFullTestError]        = useState<string | null>(null);
  const [currentFullTestStep,  setCurrentFullTestStep]  = useState(0);
  const [dismissedUrls,        setDismissedUrls]        = useState<string[]>([]);

  /* ── helpers ── */
  const openArticle = (a: NewsArticle) => {
    setSelectedArticle(a);
    setKeyPoints(null);
    setQuiz(null);
    setShowResults(false);
    setUserAnswers({});
    setQuizError(null);
    setCurrentQuizStep(0);
  };
  const closeArticle = () => setSelectedArticle(null);

  const handleAnalyze = async () => {
    if (!selectedArticle) return;
    try {
      setAnalyzing(true);
      setQuizError(null);
      const res = await fetch("/api/analyze-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article: selectedArticle }),
      });
      if (!res.ok) throw new Error("Failed to analyze article.");
      const data = await res.json();
      setKeyPoints(data.keyPoints || []);
      setQuiz(data.quiz || []);
    } catch (e: any) {
      setQuizError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  async function load() {
    try {
      setLoading(true);
      const url = `/api/news?category=${category === "all" ? "" : category}&period=${period}&pageSize=40`;
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [category, period]);

  const hasAutoStarted = React.useRef(false);
  useEffect(() => {
    const autoStart = searchParams.get("startTest") === "true";
    if (autoStart && !loading && articles.length > 0 && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      setShowFullTestModal(true);
    }
  }, [searchParams, loading, articles.length]);

  const filtered = articles
    .filter((a) => !dismissedUrls.includes(a.url))
    .filter((a) => search ? a.title.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) =>
      sort === "latest"
        ? new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        : (a.examRelevance === "high" ? 0 : a.examRelevance === "medium" ? 1 : 2) -
          (b.examRelevance === "high" ? 0 : b.examRelevance === "medium" ? 1 : 2)
    );

  /* ───────────────────────────── RENDER ───────────────────────────── */
  return (
    <>
      {/* ══════════════════ PAGE WRAPPER ══════════════════ */}
      <div className="retro-container animate-fade-up">

        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="page-h">Intelligence Port</div>
            <div className="page-sub">
              {filtered.length} curated intelligence reports – Deciphered for Bank Exams
            </div>
          </div>
          <button
            className="refresh-btn w-full sm:w-auto justify-center"
            onClick={load}
            disabled={loading}
            suppressHydrationWarning
          >
            🔄 {loading ? "Syncing…" : "Refresh"}
          </button>
        </div>

        {/* ══════════════════ MEGA TEST CARD ══════════════════ */}
        <div
          className="w-full mb-8 p-5 sm:p-7 md:p-9 rounded-[24px] sm:rounded-[36px] md:rounded-[44px]
                     bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600
                     shadow-[0_25px_60px_rgba(79,70,229,0.35)] relative overflow-hidden
                     cursor-pointer border border-white/20
                     transition-all hover:-translate-y-1 active:scale-[0.98]"
          onClick={() => setShowFullTestModal(true)}
        >
          {/* decorative blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* left copy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white/20 p-2 rounded-xl border border-white/30">
                  <Brain size={20} className="text-white" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[4px] text-white/90 truncate">
                  Protocol v9.5 • Sync Active
                </span>
              </div>

              <h2 className="text-[18px] sm:text-[24px] md:text-[30px] font-black text-white
                             tracking-[-0.04em] leading-[1.05] mb-3 max-w-2xl">
                {period === "day" ? "Today's" : period === "week" ? "Weekly" : "Monthly"}{" "}
                Terminal Strategic Assessment
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2
                              text-white/80 text-[10px] sm:text-[12px] font-bold uppercase tracking-[2px]">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-[2px] bg-white/40" />
                  50 Strategic MCQ Vectors
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] sm:text-[10px]">
                  {period.toUpperCase()} ROLLUP
                </span>
              </div>
            </div>

            {/* CTA button */}
            <button
              className="w-full lg:w-auto flex-shrink-0
                         px-8 sm:px-12 py-4 sm:py-5
                         bg-white text-indigo-600 rounded-[18px] sm:rounded-[24px]
                         font-black text-[12px] sm:text-[14px] uppercase tracking-[3px]
                         shadow-2xl transition-all hover:bg-slate-900 hover:text-white
                         border-none flex items-center justify-center gap-3"
              onClick={(e) => { e.stopPropagation(); setShowFullTestModal(true); }}
              disabled={loading || articles.length === 0}
              suppressHydrationWarning
            >
              {loading ? "SYNCING…" : articles.length === 0 ? "EMPTY" : analyzingFull ? "PROCESSING…" : "Initialize Test"}
              {!loading && articles.length > 0 && (
                <ChevronRight size={16} />
              )}
            </button>
          </div>
        </div>

        {/* ══════════════════ FILTERS ══════════════════ */}
        <div className="flex flex-col gap-4 mb-10" data-html2canvas-ignore="true">
          {/* Search */}
          <div className="flex items-center py-3 px-5 rounded-[20px] bg-slate-100
                          border border-slate-200 shadow-sm
                          focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
            <span className="text-[18px] mr-3 opacity-60 flex-shrink-0">🔍</span>
            <input
              type="text"
              placeholder="Search intelligence dossiers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suppressHydrationWarning
              className="bg-transparent border-none text-slate-800 outline-none w-full
                         font-bold text-[14px] placeholder:text-slate-400"
            />
          </div>

          {/* Selects row – wraps on very small screens */}
          <div className="flex flex-col xs:flex-row gap-3">
            <select
              className="flex-1 bg-white text-slate-800 font-black text-[11px] uppercase
                         tracking-[2px] px-5 py-4 rounded-[18px] border-2 border-slate-100
                         shadow-sm outline-none cursor-pointer"
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              suppressHydrationWarning
            >
              <option value="day">Today's Feed</option>
              <option value="week">Weekly Rollup</option>
              <option value="month">Monthly Brief</option>
            </select>

            <select
              className="flex-1 bg-white text-slate-800 font-black text-[11px] uppercase
                         tracking-[2px] px-5 py-4 rounded-[18px] border-2 border-slate-100
                         shadow-sm outline-none cursor-pointer"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              suppressHydrationWarning
            >
              <option value="relevance">By Significance</option>
              <option value="latest">By Recency</option>
            </select>
          </div>
        </div>

        {/* ══════════════════ CONTENT STATES ══════════════════ */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-4 bg-sky-500/5 rounded-full flex items-center justify-center">
                <Sparkles className="text-sky-500 w-6 h-6 animate-pulse" />
              </div>
            </div>
            <p className="text-sky-500 font-black text-[11px] uppercase tracking-[6px] animate-pulse">
              ACCESSING SECURE DATA FEED…
            </p>
          </div>

        ) : error ? (
          <div className="py-16 text-center card bg-red-950/20 border-red-900/40 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center
                            mx-auto mb-6 border border-red-500/20">
              <X className="text-red-500" size={28} />
            </div>
            <p className="text-red-400 font-bold text-[15px] px-6">{error}</p>
            <button
              onClick={load}
              className="mt-6 text-slate-500 hover:text-white font-black text-[11px] uppercase tracking-widest transition-colors"
            >
              Re-attempt Link Up
            </button>
          </div>

        ) : (
          /* ── News Grid – 1 col → 2 col → 3 col → 4 col ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((a, i) => {
              const design = getCategoryDesign(a.category);
              const accent = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <div
                  key={i}
                  className="card news-card news-card-compact flex flex-col"
                  style={{ borderColor: `${accent}30` }}
                >
                  <div
                    className="news-img !h-[56px] !p-3 relative group/header"
                    style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDismissedUrls(prev => [...prev, a.url]);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20
                                 items-center justify-center text-white/40 hover:text-white
                                 hover:bg-red-500/80 transition-all flex z-10 opacity-0
                                 group-hover/header:opacity-100"
                      title="Dismiss Dossier"
                    >
                      <X size={12} />
                    </button>
                    <div className="news-img-fake !text-[22px]" style={{ color: accent }}>
                      {design.icon}
                    </div>
                    <span
                      className="cat-badge cat-badge-mini"
                      style={{ borderColor: `${accent}30`, color: accent }}
                    >
                      {a.category}
                    </span>
                  </div>

                  <div className="news-body !p-3 flex flex-col flex-1">
                    <div className="news-title news-title-compact">{a.title}</div>
                    <div className="news-desc news-desc-compact flex-1">
                      {a.description || (a.content?.substring(0, 100) + "…")}
                    </div>
                    <div className="news-footer !mt-3 !pt-3">
                      <div className="news-meta meta-mini flex-1 min-w-0">
                        <span className="truncate">{a.source.name}</span>
                        <span className="flex-shrink-0">
                          📅 {new Date(a.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="news-actions flex-shrink-0" data-html2canvas-ignore="true">
                        <button
                          onClick={() => openArticle(a)}
                          className="icon-btn !w-7 !h-7"
                          title="Analyze & Quiz"
                        >
                          🤖
                        </button>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="icon-btn !w-7 !h-7"
                          title="Read Full"
                        >
                          ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          ARTICLE MODAL
      ══════════════════════════════════════════════ */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"
            onClick={closeArticle}
          />
          <div
            className="relative w-full sm:max-w-2xl
                       h-[92vh] sm:max-h-[92vh]
                       overflow-y-auto
                       bg-black border-t sm:border border-slate-800/50
                       rounded-t-[28px] sm:rounded-[32px]
                       shadow-[0_40px_100px_rgba(0,0,0,0.9)]
                       animate-fade-up"
          >
            {/* sticky header */}
            <div
              className="sticky top-0 z-10 p-4 sm:p-6 md:p-8
                         border-b border-white/5 bg-black/90 backdrop-blur
                         flex justify-between items-start gap-3"
            >
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] sm:text-[18px] md:text-[20px] font-black text-white
                               leading-tight tracking-tight line-clamp-3">
                  {selectedArticle.title}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <p className="text-slate-400 text-[9px] sm:text-[11px] font-black uppercase tracking-widest opacity-60">
                    Source: {selectedArticle.source.name}
                  </p>
                  <p className="text-sky-400 text-[9px] sm:text-[11px] font-black uppercase tracking-widest">
                    Relevance: {selectedArticle.examRelevance}
                  </p>
                </div>
              </div>
              <button
                onClick={closeArticle}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 hover:bg-slate-700
                           rounded-xl flex items-center justify-center text-slate-300
                           transition-all flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* ── Analyze prompt ── */}
              {!keyPoints && !analyzing && (
                <div className="py-8 px-5 sm:px-8 rounded-[20px] sm:rounded-[32px]
                                bg-sky-600/5 border border-sky-400/20 text-center">
                  <Brain size={40} className="text-sky-500 mx-auto mb-5" />
                  <h3 className="text-white font-black text-[18px] sm:text-[22px] mb-2 tracking-tighter">
                    Deep Intelligence Analysis
                  </h3>
                  <p className="text-slate-400 text-[13px] sm:text-[14px] mb-6 max-w-md mx-auto leading-relaxed">
                    Let our AI dissect this report, identify core exam pointers, and build
                    high-fidelity assessment vectors for you.
                  </p>
                  <button
                    onClick={handleAnalyze}
                    className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-500
                               text-white rounded-xl font-black text-[12px] uppercase
                               tracking-[2px] transition-all shadow-xl shadow-sky-600/20"
                  >
                    Dissect Report
                  </button>
                  {quizError && (
                    <p className="text-red-400 mt-5 text-[12px] font-bold bg-red-950/20
                                  p-4 rounded-xl border border-red-900/40">
                      {quizError}
                    </p>
                  )}
                </div>
              )}

              {/* ── Loading ── */}
              {analyzing && (
                <div className="py-16 text-center animate-pulse">
                  <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-sky-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-sky-500/10 flex items-center justify-center">
                      <Brain size={20} className="text-sky-500 animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-white font-black text-[18px] mb-2 uppercase tracking-[4px]">
                    Neural Analysis
                  </h3>
                  <p className="text-slate-500 font-bold text-[13px]">
                    Extracting strategic vectors…
                  </p>
                </div>
              )}

              {/* ── Key points ── */}
              {keyPoints && !analyzing && (
                <div className="mb-6 p-5 sm:p-7 bg-slate-800/40 border border-slate-700/50
                                rounded-2xl sm:rounded-3xl animate-fade-up">
                  <h3 className="text-sky-400 font-black text-[10px] sm:text-[12px] uppercase
                                 tracking-[4px] mb-5 flex items-center gap-3">
                    <CheckCircle2 size={16} /> High-Yield Pointers
                  </h3>
                  <ul className="space-y-3">
                    {keyPoints.map((pt, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span
                          className="w-6 h-6 rounded-lg bg-sky-900/50 text-sky-400
                                     flex items-center justify-center text-[9px] font-black
                                     flex-shrink-0 mt-0.5 border border-sky-700/30"
                        >
                          {i + 1}
                        </span>
                        <p className="text-slate-200 text-[13px] sm:text-[14px] leading-relaxed font-medium">
                          {pt}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Quiz empty state ── */}
              {!analyzing && keyPoints && (!quiz || quiz.length === 0) && (
                <div className="p-7 border border-sky-500/10 rounded-[28px] bg-slate-900/40 text-center animate-fade-up">
                  <div className="w-11 h-11 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
                    <Brain size={18} className="text-sky-500" />
                  </div>
                  <h4 className="text-white font-black text-[13px] uppercase tracking-widest mb-2">
                    Assessment Hub Offline
                  </h4>
                  <p className="text-slate-500 text-[11px] mb-5">
                    The AI is processing. If questions don't appear, please re-vector.
                  </p>
                  <button
                    onClick={handleAnalyze}
                    className="px-6 py-3 rounded-xl bg-sky-600/10 border border-sky-600/30
                               text-sky-400 font-black text-[10px] uppercase tracking-widest
                               hover:bg-sky-600/20 transition-all"
                  >
                    Re-vector Analysis
                  </button>
                </div>
              )}

              {/* ── Quiz ── */}
              {quiz && quiz.length > 0 && !analyzing && (
                <div className="p-5 sm:p-7 bg-slate-800/40 border border-sky-500/10
                                rounded-[28px] sm:rounded-[32px] relative overflow-hidden animate-fade-up">
                  <div className="absolute top-0 right-0 w-56 h-56 bg-sky-600/5 rounded-full blur-[80px] pointer-events-none" />

                  <div className="flex justify-between items-start mb-1 relative z-10">
                    <h3 className="text-white font-black text-[14px] sm:text-[16px] uppercase
                                   tracking-[2px] flex items-center gap-2">
                      <Brain size={18} className="text-sky-500" /> Dossier Assessment
                    </h3>
                    <span className="text-sky-500 font-black text-[13px]">
                      {currentQuizStep + 1} / {quiz.length}
                    </span>
                  </div>
                  <p className="text-slate-500 mb-6 text-[10px] font-black uppercase tracking-widest relative z-10">
                    Neural Fidelity Validation
                  </p>

                  {/* Question */}
                  <div className="relative z-10">
                    {(() => {
                      const q = quiz[currentQuizStep];
                      const qIndex = currentQuizStep;
                      if (!q) return null;
                      const isRevealed = userAnswers[qIndex] !== undefined;
                      return (
                        <div className="animate-fade-up">
                          <p className="text-white font-black text-[13px] sm:text-[15px] leading-snug mb-4">
                            <span className="text-sky-500 mr-2">Q{qIndex + 1}:</span>
                            {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {q.options.map((opt, oIndex) => {
                              const isSelected = userAnswers[qIndex] === oIndex;
                              const isCorrect  = isRevealed && q.correctAnswer === oIndex;
                              const isWrong    = isRevealed && isSelected && !isCorrect;
                              return (
                                <button
                                  key={oIndex}
                                  disabled={isRevealed}
                                  onClick={() =>
                                    setUserAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))
                                  }
                                  className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all
                                    ${isCorrect
                                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-100 ring-4 ring-emerald-600/10"
                                      : isWrong
                                      ? "bg-red-950/40 border-red-500 text-red-100"
                                      : isSelected
                                      ? "bg-sky-600 border-sky-400 text-white shadow-lg"
                                      : "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-sky-500/50"
                                    }`}
                                >
                                  <span
                                    className={`inline-block mr-2 w-5 h-5 text-center leading-5
                                                rounded-md text-[9px] font-black
                                                ${isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500"}`}
                                  >
                                    {["A","B","C","D"][oIndex]}
                                  </span>
                                  <span className="font-bold text-[12px] sm:text-[13px]">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {isRevealed && (
                            <div
                              className={`mt-4 p-4 rounded-2xl text-[12px] sm:text-[13px] border-l-4
                                ${userAnswers[qIndex] === q.correctAnswer
                                  ? "bg-emerald-950/30 border-emerald-500 text-emerald-100"
                                  : "bg-red-950/30 border-red-500 text-red-100"
                                }`}
                            >
                              <p className="font-black uppercase tracking-[2px] text-[8px] mb-1 opacity-60">
                                Strategic Context
                              </p>
                              <span className="font-medium leading-relaxed">{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Navigation */}
                  {!showResults ? (
                    <div className="flex gap-2 sm:gap-4 mt-8 relative z-10">
                      <button
                        onClick={() => {
                          currentQuizStep + 1 < (quiz || []).length
                            ? setCurrentQuizStep((c) => c + 1)
                            : setShowResults(true);
                        }}
                        className="flex-1 py-3 sm:py-4 rounded-xl font-black uppercase tracking-[1px]
                                   text-[10px] text-slate-400 border-2 border-slate-700/50 bg-transparent
                                   hover:border-sky-500/50 hover:text-white transition-all
                                   flex items-center justify-center gap-2"
                      >
                        <Forward size={13} className="opacity-50" /> Skip
                      </button>
                      <button
                        onClick={() => {
                          currentQuizStep + 1 < (quiz || []).length
                            ? setCurrentQuizStep((c) => c + 1)
                            : setShowResults(true);
                        }}
                        disabled={userAnswers[currentQuizStep] === undefined}
                        className="flex-[2] py-3 sm:py-4 rounded-xl font-black uppercase
                                   tracking-[2px] text-[11px] text-white transition-all
                                   shadow-xl disabled:opacity-30 disabled:cursor-not-allowed
                                   bg-sky-600 hover:bg-sky-500 border-none
                                   flex items-center justify-center gap-2"
                      >
                        {currentQuizStep + 1 < (quiz || []).length ? "Next" : "Finalize"}
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  ) : (
                    /* Results */
                    <div className="mt-10 space-y-10 pb-20 animate-fade-up">
                      <div className="text-center p-7 sm:p-12 border border-sky-400/20
                                      rounded-[28px] sm:rounded-[40px] bg-slate-950 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-sky-600/5 blur-[120px] rounded-full pointer-events-none" />
                        <div className="text-slate-500 font-black text-[9px] uppercase tracking-[6px] mb-6">
                          Intelligence Performance Report
                        </div>
                        <p className="text-[36px] sm:text-[56px] font-black text-white tracking-tighter mb-8">
                          <span className="text-sky-500">
                            {Object.keys(userAnswers).filter(
                              (k) => userAnswers[+k] === (quiz || [])[+k].correctAnswer
                            ).length}
                          </span>
                          <span className="text-slate-800 mx-3 opacity-50">/</span>
                          {(quiz || []).length}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
                          <button
                            onClick={() => {
                              setShowResults(false);
                              setUserAnswers({});
                              setCurrentQuizStep(0);
                              handleAnalyze();
                            }}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-700
                                       text-slate-400 font-black text-[10px] uppercase tracking-widest
                                       hover:border-sky-500 hover:text-white transition-all"
                          >
                            Restart Analysis
                          </button>
                          <button
                            onClick={closeArticle}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5
                                       hover:bg-white/10 text-white font-black text-[10px]
                                       uppercase tracking-widest transition-all"
                          >
                            Return to Feed
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-white font-black text-[15px] uppercase tracking-[3px]
                                       border-b border-white/5 pb-3 flex items-center gap-3">
                          <div className="w-2 h-5 bg-sky-500 rounded-full" />
                          Detailed Vector Review
                        </h3>
                        {(quiz || []).map((q, qIdx) => {
                          const userAnswer = userAnswers[qIdx];
                          const isCorrect  = userAnswer === q.correctAnswer;
                          return (
                            <div
                              key={qIdx}
                              className={`p-5 sm:p-7 rounded-[24px] border
                                ${isCorrect
                                  ? "bg-emerald-950/20 border-emerald-500/30"
                                  : "bg-red-950/20 border-red-500/30"
                                }`}
                            >
                              <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700
                                                flex items-center justify-center font-black text-[13px]
                                                text-white flex-shrink-0">
                                  {qIdx + 1}
                                </div>
                                <h4 className="text-[14px] text-white font-black leading-snug pt-0.5">
                                  {q.question}
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-0 sm:ml-11 mb-4">
                                {q.options.map((opt, oIdx) => {
                                  const isSel  = userAnswer === oIdx;
                                  const isRight= q.correctAnswer === oIdx;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-3 rounded-xl border flex items-center gap-2
                                        ${isRight
                                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-100"
                                          : isSel
                                          ? "bg-red-600/20 border-red-500 text-red-100"
                                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                                        }`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center
                                                    text-[9px] font-black flex-shrink-0
                                          ${isRight
                                            ? "bg-emerald-500 text-emerald-950"
                                            : isSel
                                            ? "bg-red-500 text-red-950"
                                            : "bg-slate-800 text-slate-500"
                                          }`}
                                      >
                                        {["A","B","C","D"][oIdx]}
                                      </div>
                                      <span className="font-bold text-[12px] leading-tight">{opt}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="ml-0 sm:ml-11 p-4 rounded-2xl bg-slate-950/80 border-l-4 border-sky-600">
                                <p className="text-sky-400 font-black text-[9px] uppercase tracking-[3px] mb-1">
                                  Strategic Context
                                </p>
                                <p className="text-slate-300 text-[12px] sm:text-[13px] leading-relaxed font-bold">
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          FULL TEST MODAL
      ══════════════════════════════════════════════ */}
      {showFullTestModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"
            onClick={() => !analyzingFull && setShowFullTestModal(false)}
          />
          <div
            className="relative w-full sm:max-w-4xl
                       h-[95vh] sm:h-[92vh]
                       overflow-y-auto
                       bg-slate-900 border-t sm:border border-slate-700/50
                       rounded-t-[28px] sm:rounded-[40px]
                       shadow-[0_0_100px_rgba(0,0,0,1)]
                       animate-fade-up"
          >
            {/* sticky header */}
            <div
              className="sticky top-0 z-20 p-4 sm:p-5 md:p-6
                         border-b-2 border-sky-400/20 bg-slate-900/98 backdrop-blur
                         flex justify-between items-center gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex-shrink-0
                             bg-gradient-to-br from-sky-400 via-purple-500 to-pink-500
                             flex items-center justify-center text-white shadow-lg"
                >
                  <Brain size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[14px] sm:text-[17px] font-black text-white
                                 leading-tight tracking-tighter truncate">
                    Terminal Strategic Assessment
                  </h2>
                  <p className="text-sky-400 text-[9px] sm:text-[10px] mt-0.5 font-black
                                tracking-[2px] uppercase opacity-80">
                    50 Strategic Vectors • Sync Ready
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullTestModal(false)}
                disabled={analyzingFull}
                className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-xl
                           flex items-center justify-center text-slate-300
                           transition-all flex-shrink-0"
                suppressHydrationWarning
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {/* ── Init screen ── */}
              {!fullQuiz && !analyzingFull && (
                <div
                  className="max-w-2xl mx-auto py-10 sm:py-16 px-5 sm:px-12 text-center
                             border border-white/5 bg-slate-950/40 rounded-[28px] sm:rounded-[48px]
                             backdrop-blur-3xl shadow-2xl animate-fade-up"
                >
                  <div className="inline-block p-5 sm:p-7 rounded-3xl bg-sky-600/10 mb-6 sm:mb-8
                                  border-2 border-sky-600/20 shadow-lg shadow-sky-500/10">
                    <Play size={36} className="text-sky-500 ml-0.5" />
                  </div>
                  <h3 className="text-white font-black text-[16px] sm:text-[20px] md:text-[24px] mb-2 tracking-tighter leading-tight">
                    Initialize{" "}
                    <span className="text-sky-500">
                      {period === "day" ? "Daily" : period === "week" ? "Weekly" : "Monthly"}
                    </span>{" "}
                    Assessment?
                  </h3>
                  <p className="text-slate-400 font-bold text-[11px] sm:text-[13px] md:text-[14px] mb-8 sm:mb-10 leading-relaxed opacity-80">
                    Splicing{" "}
                    <span className="text-white font-black">{filtered.length}</span>{" "}
                    dossiers into a 50-vector strategic simulation.
                  </p>

                  <button
                    onClick={async () => {
                      try {
                        setAnalyzingFull(true);
                        setFullTestError(null);
                        const res = await fetch("/api/full-quiz", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ articles: filtered.slice(0, 25), period }),
                        });
                        if (!res.ok) throw new Error("Intelligence node is saturated. Please wait.");
                        const data = await res.json();
                        setFullQuiz(data.quiz || []);
                      } catch (e: any) {
                        setFullTestError(e.message);
                      } finally {
                        setAnalyzingFull(false);
                      }
                    }}
                    className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-5
                               bg-sky-600 hover:bg-sky-500 text-white
                               rounded-xl sm:rounded-2xl font-black
                               text-[11px] sm:text-[13px] uppercase tracking-[3px] sm:tracking-[4px]
                               transition-all shadow-2xl shadow-sky-600/40 border-none
                               flex items-center justify-center gap-3 mx-auto"
                  >
                    Initialize Strategic Test
                    <ChevronRight size={14} />
                  </button>

                  {fullTestError && (
                    <div
                      className="mt-6 w-full p-5 sm:p-8 rounded-[24px] sm:rounded-[36px]
                                 bg-red-950/40 border-2 border-red-500/30 text-red-100
                                 font-bold text-[13px] leading-relaxed animate-shake"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[3px] text-red-500 mb-1">
                        Protocol Critical Failure
                      </div>
                      {fullTestError}
                    </div>
                  )}
                </div>
              )}

              {/* ── Generating ── */}
              {analyzingFull && (
                <div className="py-32 text-center">
                  <div className="relative inline-block w-28 h-28 mb-10">
                    <div className="absolute inset-0 border-8 border-sky-600/10 rounded-full" />
                    <div className="absolute inset-0 border-8 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-white font-black text-[15px] mb-4 tracking-tighter">
                    Splicing intelligence data…
                  </h3>
                  <p className="text-sky-400 font-bold text-[13px] uppercase tracking-[6px] animate-pulse">
                    GENERATING DOCTRINE
                  </p>
                </div>
              )}

              {/* ── Quiz ── */}
              {fullQuiz && (
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* progress bar */}
                  <div
                    className="flex flex-col xs:flex-row items-center justify-between
                               p-4 sm:p-5 bg-slate-950/80 border-2 border-sky-600/30
                               rounded-[24px] sm:rounded-[32px]
                               sticky top-[70px] sm:top-[80px] z-10
                               backdrop-blur-2xl shadow-2xl gap-3"
                  >
                    <div className="flex gap-3 flex-wrap justify-center xs:justify-start">
                      <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700
                                      text-slate-400 font-black text-[10px] uppercase tracking-[1px]">
                        {Object.keys(fullTestAnswers).length} / {fullQuiz.length}
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-sky-600/10 border border-sky-600/30
                                      text-sky-400 font-black text-[10px] uppercase tracking-[1px]">
                        {Math.round(
                          (Object.keys(fullTestAnswers).length / fullQuiz.length) * 100
                        )}% Done
                      </div>
                    </div>
                    {showFullResults && (
                      <div className="px-5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/50
                                      text-emerald-400 font-black text-[13px]">
                        {Object.keys(fullTestAnswers).filter(
                          (k) => fullTestAnswers[+k] === fullQuiz![+k].correctAnswer
                        ).length}{" "}
                        / {fullQuiz.length}
                      </div>
                    )}
                  </div>

                  {/* Current question */}
                  <div className="space-y-3 pb-28">
                    {(() => {
                      const q    = fullQuiz[currentFullTestStep];
                      const qIdx = currentFullTestStep;
                      if (!q) return null;
                      const accent     = MODAL_ACCENTS[qIdx % MODAL_ACCENTS.length];
                      const isRevealed = fullTestAnswers[qIdx] !== undefined;

                      return (
                        <div className="animate-fade-up">
                          <div className="flex items-start gap-3 mb-4">
                            <div
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-950 border
                                         flex items-center justify-center font-black text-[13px] flex-shrink-0
                                         ${accent.border} ${accent.text}`}
                            >
                              {qIdx + 1}
                            </div>
                            <h4 className="text-[13px] sm:text-[15px] text-white font-black
                                           leading-snug pt-0.5 tracking-tight">
                              {q.question}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 ml-0 sm:ml-11">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = fullTestAnswers[qIdx] === oIdx;
                              const isCorrect  = isRevealed && q.correctAnswer === oIdx;
                              const isWrong    = isRevealed && isSelected && !isCorrect;
                              return (
                                <button
                                  key={oIdx}
                                  disabled={isRevealed}
                                  onClick={() =>
                                    setFullTestAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                                  }
                                  className={`p-3 sm:p-4 text-left rounded-2xl border transition-all
                                    ${isCorrect
                                      ? "bg-emerald-950/80 border-emerald-600 text-emerald-100 ring-4 ring-emerald-600/10"
                                      : isWrong
                                      ? "bg-red-950/80 border-red-600 text-red-100"
                                      : isSelected
                                      ? "bg-sky-600 border-sky-400 text-white shadow-xl"
                                      : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                                    }`}
                                >
                                  <span
                                    className={`inline-block mr-2 w-5 h-5 rounded-md text-center
                                                leading-5 text-[9px] font-black
                                                ${isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-600"}`}
                                  >
                                    {["A","B","C","D"][oIdx]}
                                  </span>
                                  <span className="font-bold text-[12px] sm:text-[14px]">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {isRevealed && (
                            <div
                              className={`ml-0 sm:ml-11 mt-4 p-4 sm:p-5 rounded-3xl border-l-[6px]
                                         shadow-xl animate-fade-up
                                ${fullTestAnswers[qIdx] === q.correctAnswer
                                  ? "bg-emerald-950 border-emerald-600/50"
                                  : "bg-red-950 border-red-600/50"
                                }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <CheckCircle2 size={13} className="text-sky-400" />
                                <span className="font-black text-[9px] uppercase tracking-[3px] text-white/60">
                                  Strategic Vector Correction
                                </span>
                              </div>
                              <p className="text-white text-[12px] sm:text-[14px] leading-relaxed font-bold">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Sticky nav */}
                  {!showFullResults ? (
                    <div
                      className="sticky bottom-4 z-20
                                 px-4 sm:px-6 py-4 bg-slate-950/95
                                 border-2 border-sky-600/30 rounded-[24px] sm:rounded-[32px]
                                 flex flex-col xs:flex-row justify-between items-center
                                 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl gap-3"
                    >
                      <div className="text-center xs:text-left hidden sm:block">
                        <p className="text-white font-black text-[13px] tracking-tighter">
                          Submit assessment?
                        </p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[1px]">
                          {Object.keys(fullTestAnswers).length} / {fullQuiz.length} synced
                        </p>
                      </div>

                      <div className="flex gap-2 w-full xs:w-auto">
                        <button
                          onClick={() => {
                            currentFullTestStep + 1 < (fullQuiz || []).length
                              ? setCurrentFullTestStep((c) => c + 1)
                              : setShowFullResults(true);
                          }}
                          className="flex-1 xs:flex-none px-5 py-3 sm:py-4 rounded-xl font-black
                                     uppercase tracking-[1px] text-[10px] text-slate-500
                                     border-2 border-slate-800 bg-transparent
                                     hover:border-slate-600 hover:text-white transition-all
                                     flex items-center justify-center gap-2"
                        >
                          <Forward size={14} className="opacity-50" /> Skip
                        </button>
                        <button
                          onClick={() => {
                            currentFullTestStep + 1 < (fullQuiz || []).length
                              ? setCurrentFullTestStep((c) => c + 1)
                              : setShowFullResults(true);
                          }}
                          disabled={fullTestAnswers[currentFullTestStep] === undefined}
                          className="flex-[2] xs:flex-none px-8 sm:px-12 py-3 sm:py-4
                                     bg-sky-600 hover:bg-sky-500 text-white rounded-xl
                                     font-black text-[11px] sm:text-[13px] uppercase tracking-[2px]
                                     transition-all shadow-2xl
                                     flex items-center justify-center gap-2
                                     disabled:opacity-30 disabled:cursor-not-allowed border-none"
                        >
                          {currentFullTestStep + 1 < (fullQuiz || []).length
                            ? "Next Node"
                            : "Finalize Mission"}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Full test results */
                    <div className="mt-8 space-y-10 pb-20 animate-fade-up">
                      <div
                        className="text-center p-7 sm:p-12 md:p-16
                                   border border-sky-400/20 rounded-[28px] sm:rounded-[48px]
                                   bg-slate-950 shadow-2xl relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-sky-600/5 blur-[120px] rounded-full pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="px-4 py-1 rounded-full bg-sky-600/10 border border-sky-500/30
                                          text-sky-400 font-bold text-[9px] uppercase tracking-[4px] mb-6">
                            Strategic Mastery{" "}
                            {Math.round(
                              (Object.keys(fullTestAnswers).filter(
                                (k) => fullTestAnswers[+k] === (fullQuiz || [])[+k].correctAnswer
                              ).length /
                                fullQuiz.length) *
                                100
                            )}%
                          </div>
                          <div className="text-slate-500 font-black text-[9px] sm:text-[10px]
                                          uppercase tracking-[6px] sm:tracking-[10px] mb-6">
                            Intelligence Performance Report
                          </div>
                          <p className="text-[48px] sm:text-[68px] md:text-[84px] font-black
                                        text-white tracking-tighter mb-8 leading-none">
                            <span className="text-sky-500">
                              {Object.keys(fullTestAnswers).filter(
                                (k) => fullTestAnswers[+k] === (fullQuiz || [])[+k].correctAnswer
                              ).length}
                            </span>
                            <span className="text-slate-800 mx-3 opacity-50">/</span>
                            {(fullQuiz || []).length}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 relative z-10">
                          <button
                            onClick={() => {
                              setShowFullResults(false);
                              setFullTestAnswers({});
                              setCurrentFullTestStep(0);
                            }}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl border border-slate-700
                                       text-slate-400 font-black text-[10px] uppercase tracking-widest
                                       hover:border-sky-500 hover:text-white transition-all"
                          >
                            Restart Sequence
                          </button>
                          <button
                            onClick={() => setShowFullTestModal(false)}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/5
                                       hover:bg-white/10 text-white font-black text-[10px]
                                       uppercase tracking-widest transition-all"
                          >
                            Return to Terminal
                          </button>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-6">
                        <h3 className="text-white font-black text-[15px] uppercase tracking-[3px]
                                       border-b border-white/5 pb-3 flex items-center gap-3">
                          <div className="w-2 h-5 bg-sky-500 rounded-full" />
                          Strategic Vector Analysis
                        </h3>
                        {(fullQuiz || []).map((q, qIdx) => {
                          const userAnswer = fullTestAnswers[qIdx];
                          const isCorrect  = userAnswer === q.correctAnswer;
                          const accent     = MODAL_ACCENTS[qIdx % MODAL_ACCENTS.length];
                          return (
                            <div
                              key={qIdx}
                              className={`p-5 sm:p-7 rounded-[24px] border
                                ${isCorrect
                                  ? "bg-emerald-950/20 border-emerald-500/30"
                                  : "bg-red-950/20 border-red-500/30"
                                }`}
                            >
                              <div className="flex items-start gap-3 mb-4">
                                <div
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border
                                             flex items-center justify-center font-black text-[13px] flex-shrink-0
                                             ${accent.border} ${accent.text}`}
                                >
                                  {qIdx + 1}
                                </div>
                                <h4 className="text-[13px] sm:text-[15px] text-white font-black leading-snug pt-0.5">
                                  {q.question}
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-0 sm:ml-11 mb-4">
                                {q.options.map((opt, oIdx) => {
                                  const isSel   = userAnswer === oIdx;
                                  const isRight = q.correctAnswer === oIdx;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-3 rounded-xl border flex items-center gap-2
                                        ${isRight
                                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-100"
                                          : isSel
                                          ? "bg-red-600/20 border-red-500 text-red-100"
                                          : "bg-slate-900/40 border-slate-800 text-slate-500"
                                        }`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center
                                                    text-[9px] font-black flex-shrink-0
                                          ${isRight
                                            ? "bg-emerald-500 text-emerald-950"
                                            : isSel
                                            ? "bg-red-500 text-red-950"
                                            : "bg-slate-800 text-slate-500"
                                          }`}
                                      >
                                        {["A","B","C","D"][oIdx]}
                                      </div>
                                      <span className="font-bold text-[12px] sm:text-[13px] leading-tight">
                                        {opt}
                                      </span>
                                      {isRight && (
                                        <CheckCircle2 size={14} className="ml-auto text-emerald-400 flex-shrink-0" />
                                      )}
                                      {isSel && !isRight && (
                                        <X size={14} className="ml-auto text-red-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="ml-0 sm:ml-11 p-4 rounded-2xl bg-slate-950/50 border-l-4 border-sky-600">
                                <p className="text-sky-400 font-black text-[8px] uppercase tracking-[3px] mb-1 opacity-60">
                                  Neural Briefing
                                </p>
                                <p className="text-slate-300 text-[12px] sm:text-[13px] leading-relaxed font-medium">
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────── PAGE EXPORT ─────────────────────────── */
export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center bg-slate-950 min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={44} />
          <p className="text-sky-500 font-bold uppercase tracking-[4px] animate-pulse text-[12px]">
            Syncing Strategic Nodes…
          </p>
        </div>
      }
    >
      <NewsContent />
    </Suspense>
  );
}