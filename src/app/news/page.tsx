"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NewsArticle, NewsCategory, QuizQuestion } from "@/types";
import { Brain, Play, CheckCircle2, X, Sparkles, Loader2, ChevronRight, Forward } from "lucide-react";

import "./news.css";

const CARD_COLORS = [
  '#4ade80', '#38bdf8', '#a855f7', '#f472b6', '#fbbf24', '#f87171', '#2dd4bf', '#818cf8'
];

const MODAL_ACCENTS = [
  { text: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' },
  { text: 'text-sky-400', border: 'border-sky-500/50', bg: 'bg-sky-500/10' },
  { text: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-500/10' },
  { text: 'text-pink-400', border: 'border-pink-500/50', bg: 'bg-pink-500/10' },
  { text: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10' },
];

function getCategoryDesign(cat: string) {
  const map: Record<string, any> = {
    economy: { icon: '💹', class: 'cat-economy', accent: '#4ade80' },
    banking: { icon: '🏦', class: 'cat-banking', accent: '#38bdf8' },
    government: { icon: '🏛️', class: 'cat-gov', accent: '#a855f7' },
    international: { icon: '🌏', class: 'cat-intl', accent: '#f472b6' },
    'science-tech': { icon: '🛸', class: 'cat-sci', accent: '#fbbf24' },
    awards: { icon: '🥇', class: 'cat-award', accent: '#f87171' },
    sports: { icon: '🏏', class: 'cat-sport', accent: '#2dd4bf' },
    appointments: { icon: '👤', class: 'cat-apt', accent: '#818cf8' },
    general: { icon: '📰', class: 'cat-gen', accent: '#94a3b8' },
  };
  const design = map[cat.toLowerCase()] || map.general;
  return { ...design, bg: `linear-gradient(135deg, ${design.accent}20, transparent)` };
}

function NewsContent() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"relevance" | "latest">("relevance");

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [keyPoints, setKeyPoints] = useState<string[] | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuizStep, setCurrentQuizStep] = useState(0);

  // Full Test States
  const [showFullTestModal, setShowFullTestModal] = useState(false);
  const [fullQuiz, setFullQuiz] = useState<QuizQuestion[] | null>(null);
  const [analyzingFull, setAnalyzingFull] = useState(false);
  const [fullTestAnswers, setFullTestAnswers] = useState<Record<number, number>>({});
  const [showFullResults, setShowFullResults] = useState(false);
  const [fullTestError, setFullTestError] = useState<string | null>(null);
  const [currentFullTestStep, setCurrentFullTestStep] = useState(0);



  const openArticle = (a: NewsArticle) => {
    setSelectedArticle(a);
    setKeyPoints(null);
    setQuiz(null);
    setShowResults(false);
    setUserAnswers({});
    setQuizError(null);
    setCurrentQuizStep(0);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

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

  const handleLoadMoreQuiz = async () => {
    if (!selectedArticle || !quiz) return;
    try {
      setAnalyzing(true);
      const res = await fetch("/api/full-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: [selectedArticle] }),
      });
      if (!res.ok) throw new Error("Our AI engine is currently busy. Please wait 10 seconds.");
      const data = await res.json();
      const newBatch = (data.quiz || []).slice(0, 10);
      setQuiz([...quiz, ...newBatch]);
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
    // Check if we should auto-start the test from query param
    const autoStart = searchParams.get("startTest") === "true";
    if (autoStart && !loading && articles.length > 0 && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      setShowFullTestModal(true);
    }
  }, [searchParams, loading, articles.length]);

  const filtered = articles
    .filter((a) => search ? a.title.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) =>
      sort === "latest"
        ? new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        : (a.examRelevance === "high" ? 0 : a.examRelevance === "medium" ? 1 : 2) -
        (b.examRelevance === "high" ? 0 : b.examRelevance === "medium" ? 1 : 2)
    );

  return (
    <>
      <div className="retro-container animate-fade-up">


        <div>
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <div className="page-h">Intelligence Port</div>
              <div className="page-sub">
                {filtered.length} curated intelligence reports • Deciphered for Bank Exams
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto" data-html2canvas-ignore="true">
              <button className="refresh-btn w-full md:w-auto justify-center" onClick={load} disabled={loading} suppressHydrationWarning>
                🔄 {loading ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Mega Test Strategic Card */}
          <div className="mega-test-card group">
            <div className="mega-test-content">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                  <Brain size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[4px] text-white/80">CBT Protocol 7.9</span>
              </div>
              <h2 className="text-[18px] sm:text-[20px] md:text-2xl font-black text-white tracking-tighter mb-1 leading-tight break-words">
                {period === 'day' ? 'Today\'s' : period === 'week' ? 'Weekly' : 'Monthly'} Mega Intelligence Assessment
              </h2>
              <p className="text-white/80 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                Synthesis of {filtered.length} {period === 'day' ? 'daily' : period === 'week' ? 'weekly' : 'monthly'} briefings into 50 strategic MCQ vectors.
              </p>
            </div>
            <button
              className="mt-btn group-hover:bg-slate-900 group-hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullTestModal(true);
              }}
              disabled={loading || articles.length === 0}
              suppressHydrationWarning
            >
              {loading ? 'Syncing Dossier...' : articles.length === 0 ? 'Dossier Empty' : analyzingFull ? 'Generating Node...' : 'Initialize Terminal Test'}
              {!loading && articles.length > 0 && <ChevronRight size={14} />}
            </button>
          </div>

          <div className="search-row !mt-0 !mb-8" data-html2canvas-ignore="true">
            <div className="search-box !py-3 !px-4 !text-[12px]">
              <span style={{ fontSize: '18px' }}>🔍</span>
              <input
                type="text"
                placeholder="Search dossiers..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                suppressHydrationWarning
                style={{ background: 'transparent', border: 'none', color: '#000', outline: 'none', width: '100%', fontWeight: 500 }}
              />
            </div>

            <select className="card sort-sel" value={period} onChange={(e) => setPeriod(e.target.value as any)} suppressHydrationWarning>
              <option value="day">Today</option>
              <option value="week">Weekly Rollup</option>
              <option value="month">Monthly Brief</option>
            </select>

            <select className="card sort-sel" value={sort} onChange={(e) => setSort(e.target.value as any)} suppressHydrationWarning>
              <option value="relevance">By Significance</option>
              <option value="latest">By Recency</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-4 bg-sky-500/5 rounded-full flex items-center justify-center">
                  <Sparkles className="text-sky-500 w-8 h-8 animate-pulse" />
                </div>
              </div>
              <p className="text-sky-500 font-black text-[12px] uppercase tracking-[8px] animate-pulse">ACCESSING SECURE DATA FEED...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center card bg-red-950/20 border-red-900/40 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <X className="text-red-500" size={32} />
              </div>
              <p className="text-red-400 font-bold text-[16px] px-10">{error}</p>
              <button onClick={load} className="mt-8 text-slate-500 hover:text-white font-black text-[12px] uppercase tracking-widest transition-colors">Re-attempt Link Up</button>
            </div>
          ) : (
            <div className="news-grid-4">
              {filtered.map((a, i) => {
                const design = getCategoryDesign(a.category);
                const accent = CARD_COLORS[i % CARD_COLORS.length];
                return (
                  <div className={`card news-card news-card-compact`} key={i} style={{ borderColor: `${accent}30` }}>
                    <div className="news-img !h-[60px] !p-4" style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}>
                      <div className="news-img-fake !text-[24px]" style={{ color: accent }}>{design.icon}</div>
                      <span className="cat-badge cat-badge-mini" style={{ borderColor: `${accent}30`, color: accent }}>{a.category}</span>
                    </div>
                    <div className="news-body !p-4">
                      <div className="news-title news-title-compact">{a.title}</div>
                      <div className="news-desc news-desc-compact">{a.description || a.content?.substring(0, 100) + '...'}</div>
                      <div className="news-footer !mt-4 !pt-3">
                        <div className="news-meta meta-mini">
                          {a.source.name}
                          <span>📅 {new Date(a.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="news-actions" data-html2canvas-ignore="true">
                          <button onClick={() => openArticle(a)} className="icon-btn !w-7 !h-7" title="Analyze & Quiz">🤖</button>
                          <a href={a.url} target="_blank" rel="noreferrer" className="icon-btn !w-7 !h-7" title="Read Full">↗</a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={closeArticle} />
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-black border border-slate-800/50 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.9)] animate-fade-up">
            <div className="sticky top-0 z-10 p-6 md:p-8 border-b border-white/5 bg-black/90 backdrop-blur flex justify-between items-center">
              <div>
                <h2 className="text-[18px] md:text-[20px] font-black text-white leading-tight tracking-tight">{selectedArticle.title}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <p className="text-slate-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest opacity-60">Source: {selectedArticle.source.name}</p>
                  <p className="text-sky-400 text-[10px] md:text-[11px] font-black uppercase tracking-widest">Relevance: {selectedArticle.examRelevance}</p>
                </div>
              </div>
              <button onClick={closeArticle} className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 transition-all flex-shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              {!keyPoints && !analyzing && (
                <div className="py-8 sm:py-10 px-5 sm:px-8 rounded-[24px] sm:rounded-[32px] bg-sky-600/5 border border-sky-400/20 text-center">
                  <Brain size={44} className="text-sky-500 mx-auto mb-6 shadow-sky-500/20" />
                  <h3 className="text-white font-black text-[20px] md:text-[24px] mb-3 tracking-tighter">Deep Intelligence Analysis</h3>
                  <p className="text-slate-400 font-medium text-[13px] md:text-[14px] mb-8 max-w-md mx-auto leading-relaxed">Let our AI dissect this report, identify core exam pointers, and build high-fidelity assessment vectors for you.</p>
                  <button onClick={handleAnalyze} className="w-full sm:w-auto px-6 sm:px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-[12px] sm:text-[13px] uppercase tracking-[2px] sm:tracking-[3px] transition-all shadow-xl shadow-sky-600/20">
                    Dissect Report
                  </button>
                  {quizError && <p className="text-red-400 mt-6 text-[12px] font-bold bg-red-950/20 p-4 rounded-xl border border-red-900/40">{quizError}</p>}
                </div>
              )}

              {analyzing && (
                <div className="py-24 text-center">
                  <div className="w-20 h-20 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-10" />
                  <h3 className="text-white font-black text-[20px] mb-2 uppercase tracking-widest animate-pulse">Running Neural Inference...</h3>
                  <p className="text-slate-500 font-bold text-[14px]">Extracting exam vectors from Article Dossier</p>
                </div>
              )}

              {keyPoints && (
                <div className="mb-8 p-6 md:p-8 bg-slate-800/40 border border-slate-700/50 rounded-3xl animate-fade-up">
                  <h3 className="text-sky-400 font-black text-[11px] md:text-[12px] uppercase tracking-[4px] mb-6 flex items-center gap-3">
                    <CheckCircle2 size={18} /> High-Yield Pointers
                  </h3>
                  <ul className="space-y-4">
                    {keyPoints.map((pt, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <span className="w-7 h-7 rounded-lg bg-sky-900/50 text-sky-400 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 border border-sky-700/30">{i + 1}</span>
                        <p className="text-slate-200 text-[14px] md:text-[15px] leading-relaxed font-medium">{pt}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {quiz && (
                <div className="p-6 md:p-8 bg-slate-800/40 border border-sky-500/10 rounded-[32px] relative overflow-hidden animate-fade-up">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sky-600/5 rounded-full blur-[80px] pointer-events-none" />
                  <div className="flex justify-between items-start mb-1 relative z-10">
                    <h3 className="text-white font-black text-[16px] md:text-[18px] uppercase tracking-[2px] flex items-center gap-3">
                      <Brain size={20} className="text-sky-500" /> Dossier Assessment
                    </h3>
                    <span className="text-sky-500 font-black text-[14px]">
                      {currentQuizStep + 1} / {quiz.length}
                    </span>
                  </div>
                  <p className="text-slate-500 mb-8 text-[11px] font-black uppercase tracking-widest relative z-10">Neural Fidelity Validation</p>

                  <div className="relative z-10">
                    {(() => {
                      const q = quiz[currentQuizStep];
                      const qIndex = currentQuizStep;
                      return (
                        <div className="animate-fade-up">
                          <p className="text-white font-black text-[14px] md:text-[16px] leading-snug mb-5">
                            <span className="text-sky-500 mr-2">QUEST {qIndex + 1}:</span> {q.question}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, oIndex) => {
                              const isSelected = userAnswers[qIndex] === oIndex;
                              const isCorrect = showResults && q.correctAnswer === oIndex;
                              const isWrong = showResults && isSelected && !isCorrect;

                              return (
                                <button
                                  key={oIndex}
                                  disabled={showResults}
                                  onClick={() => setUserAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                                  className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all group ${isCorrect ? "bg-emerald-950/40 border-emerald-500 text-emerald-100 ring-4 ring-emerald-600/10"
                                    : isWrong ? "bg-red-950/40 border-red-500 text-red-100 ring-4 ring-red-600/10"
                                      : isSelected ? "bg-sky-600 border-sky-400 text-white shadow-lg"
                                        : "bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-sky-500/50 hover:bg-slate-800"
                                    }`}
                                >
                                  <span className={`inline-block mr-3 w-6 h-6 text-center leading-6 rounded-md text-[10px] font-black ${isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500 group-hover:text-sky-400"
                                    }`}>{["A", "B", "C", "D"][oIndex]}</span>
                                  <span className="font-bold text-[13px] md:text-[14px]">{opt}</span>
                                </button>
                              )
                            })}
                          </div>
                          {showResults && (
                            <div className={`mt-5 p-5 rounded-2xl text-[13px] md:text-[14px] border-l-4 ${userAnswers[qIndex] === q.correctAnswer ? "bg-emerald-950/30 border-emerald-500 text-emerald-100" : "bg-red-950/30 border-red-500 text-red-100"}`}>
                              <p className="font-black uppercase tracking-[2px] text-[9px] mb-2 opacity-60">Strategic Context</p>
                              <span className="font-medium leading-relaxed">{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {!showResults ? (
                    <div className="flex flex-col sm:flex-row items-center gap-5 mt-14 relative z-10">
                      <button
                        onClick={() => {
                          if (currentQuizStep + 1 < (quiz || []).length) {
                            setCurrentQuizStep(c => c + 1);
                          } else {
                            setShowResults(true);
                          }
                        }}
                        className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-[2px] text-[11px] text-slate-400 border-2 border-slate-700/50 bg-transparent hover:border-sky-500/50 hover:text-white transition-all flex items-center justify-center gap-3 group"
                      >
                        <Forward size={16} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                        Skip Node
                      </button>
                      <button
                        onClick={() => {
                          if (currentQuizStep + 1 < (quiz || []).length) {
                            setCurrentQuizStep(c => c + 1);
                          } else {
                            setShowResults(true);
                          }
                        }}
                        disabled={userAnswers[currentQuizStep] === undefined}
                        className="flex-1 w-full py-5 rounded-2xl font-black uppercase tracking-[3px] text-[12px] text-white transition-all shadow-2xl shadow-sky-900/20 disabled:opacity-30 disabled:cursor-not-allowed bg-sky-600 hover:bg-sky-500 border-none flex items-center justify-center gap-3 group"
                      >
                        {currentQuizStep + 1 < (quiz || []).length ? "Next Node" : "Finalize Report"}
                        <ChevronRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-14 p-10 border border-slate-700 rounded-[40px] bg-slate-950/60 text-center relative z-10 flex flex-col gap-6 shadow-2xl">
                      <div className="absolute inset-0 bg-sky-600/5 blur-3xl rounded-full pointer-events-none" />
                      <div className="text-slate-500 font-black text-[10px] uppercase tracking-[5px]">Neural Proficiency Report</div>
                      <p className="font-black text-[48px] text-white tracking-tighter">
                        <span className="text-sky-500">{Object.keys(userAnswers).filter(k => userAnswers[parseInt(k)] === (quiz || [])[parseInt(k)].correctAnswer).length}</span> <span className="text-slate-700">/</span> {(quiz || []).length}
                      </p>
                      <button
                        onClick={() => { setShowResults(false); setUserAnswers({}); setCurrentQuizStep(0); handleLoadMoreQuiz(); }}
                        className="w-full py-4 text-[11px] font-black text-white uppercase tracking-[3px] transition-all border border-sky-500/30 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20"
                      >
                        Retrain & Refresh Data Node
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL TEST MODAL */}
      {showFullTestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => !analyzingFull && setShowFullTestModal(false)} />
          <div className="relative w-full max-w-4xl h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,1)] animate-fade-up">
            <div className="sticky top-0 z-20 p-5 md:p-6 border-b-2 border-sky-400/20 bg-slate-900/98 backdrop-blur flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-sky-400 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                  <Brain size={22} />
                </div>
                <div>
                  <h2 className="text-[15px] md:text-[18px] font-black text-white leading-tight tracking-tighter">Terminal Strategic Assessment</h2>
                  <p className="text-sky-400 text-[9px] md:text-[11px] mt-0.5 font-black tracking-[1.5px] md:tracking-[3px] uppercase opacity-80">50 Strategic Vectors • Sync Ready</p>
                </div>
              </div>
              <button
                onClick={() => setShowFullTestModal(false)}
                disabled={analyzingFull}
                className="w-9 h-9 md:w-10 md:h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 transition-all flex-shrink-0"
                suppressHydrationWarning
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 md:p-8">
              {!fullQuiz && !analyzingFull && (
                <div className="max-w-2xl mx-auto py-12 md:py-16 text-center">
                  <div className="inline-block p-4 rounded-full bg-sky-600/10 mb-4 border border-sky-600/20">
                    <Play size={36} className="text-sky-500" />
                  </div>
                  <h3 className="text-white font-black text-[12px] md:text-[16px] mb-3 tracking-tighter">Initialize {period === 'day' ? 'Daily' : period === 'week' ? 'Weekly' : 'Monthly'} Assessment?</h3>
                  <p className="text-slate-400 font-bold text-[13px] md:text-[15px] mb-8 leading-relaxed max-w-sm mx-auto">
                    Synthesis of {filtered.length} {period === 'day' ? 'today\'s' : period === 'week' ? 'weekly' : 'monthly'} dossiers into 50 MCQ vectors.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        setAnalyzingFull(true);
                        setFullTestError(null);
                        const res = await fetch("/api/full-quiz", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            articles: filtered.slice(0, 25),
                            period: period
                          }),
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
                    className="w-full sm:w-auto group relative px-8 sm:px-10 py-5 bg-sky-600 hover:bg-sky-500 text-white rounded-[20px] sm:rounded-[24px] font-black text-[13px] sm:text-[14px] md:text-[16px] uppercase tracking-[2px] sm:tracking-[3px] md:tracking-[4px] transition-all shadow-xl shadow-sky-600/30"
                  >
                    Initialize Test
                  </button>
                  {fullTestError && <p className="text-red-400 mt-12 text-[13px] sm:text-[15px] font-black bg-red-950/30 p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border-2 border-red-900/50">{fullTestError}</p>}
                </div>
              )}

              {analyzingFull && (
                <div className="py-40 text-center">
                  <div className="relative inline-block w-32 h-32 mb-12">
                    <div className="absolute inset-0 border-8 border-sky-600/10 rounded-full" />
                    <div className="absolute inset-0 border-8 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <h3 className="text-white font-black text-[16px] mb-6 tracking-tighter">Splicing intelligence data...</h3>
                  <p className="text-sky-400 font-bold text-[16px] uppercase tracking-[8px] animate-pulse">GENERATING DOCTRINE</p>
                </div>
              )}

              {fullQuiz && (
                <div className="max-w-3xl mx-auto space-y-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-950/80 border-2 border-sky-600/30 rounded-[32px] sticky top-[100px] z-10 backdrop-blur-2xl shadow-2xl gap-4">
                    <div className="flex gap-4">
                      <div className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-black text-[12px] uppercase tracking-[1px]">
                        VECTORS: {Object.keys(fullTestAnswers).length} / {fullQuiz.length}
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-sky-600/10 border border-sky-600/30 text-sky-400 font-black text-[12px] uppercase tracking-[1px]">
                        DONE {Math.round((Object.keys(fullTestAnswers).length / fullQuiz.length) * 100)}%
                      </div>
                    </div>
                    {showFullResults && (
                      <div className="px-8 py-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-black text-[14px]">
                        POINTS: {Object.keys(fullTestAnswers).filter(k => fullTestAnswers[parseInt(k)] === fullQuiz[parseInt(k)].correctAnswer).length} <span className="text-emerald-700 mx-1">/</span> {fullQuiz.length}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pb-32">
                    {(() => {
                      const q = fullQuiz[currentFullTestStep];
                      const qIdx = currentFullTestStep;
                      const accent = MODAL_ACCENTS[qIdx % MODAL_ACCENTS.length];
                      return (
                        <div className="group animate-fade-up">
                          <div className="flex items-start gap-3 md:gap-4 mb-4">
                            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-950 border flex items-center justify-center font-black text-[13px] md:text-[15px] flex-shrink-0 transition-all duration-500 ${accent.border} ${accent.text}`}>
                              {qIdx + 1}
                            </div>
                            <h4 className="text-[14px] md:text-[16px] text-white font-black leading-snug pt-0.5 tracking-tight">{q.question}</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-0 md:ml-12">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = fullTestAnswers[qIdx] === oIdx;
                              const isCorrect = showFullResults && q.correctAnswer === oIdx;
                              const isWrong = showFullResults && isSelected && !isCorrect;

                              return (
                                <button
                                  key={oIdx}
                                  disabled={showFullResults}
                                  onClick={() => setFullTestAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                  className={`p-4 md:p-5 text-left rounded-2xl border transition-all relative ${isCorrect ? "bg-emerald-950/80 border-emerald-600 text-emerald-100 ring-4 ring-emerald-600/10"
                                    : isWrong ? "bg-red-950/80 border-red-600 text-red-100 ring-4 ring-red-600/10"
                                      : isSelected ? "bg-sky-600 border-sky-400 text-white shadow-xl scale-[1.01]"
                                        : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                                    }`}
                                >
                                  <span className={`inline-block mr-3 w-6 h-6 rounded-md text-center leading-6 text-[10px] font-black ${isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-600"
                                    }`}>{['A', 'B', 'C', 'D'][oIdx]}</span>
                                  <span className="font-bold text-[13px] md:text-[15px]">{opt}</span>
                                </button>
                              )
                            })}
                          </div>

                          {showFullResults && (
                            <div className="ml-0 md:ml-12 mt-5 p-5 rounded-3xl bg-slate-950 border-l-[6px] border-sky-600 shadow-xl">
                              <div className="flex items-center gap-3 mb-2">
                                <CheckCircle2 size={16} className="text-sky-400" />
                                <span className="text-sky-400 font-black text-[10px] uppercase tracking-[3px]">Neural Record Explanation</span>
                              </div>
                              <p className="text-slate-300 text-[13px] md:text-[15px] leading-relaxed font-bold">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {!showFullResults ? (
                    <div className="sticky bottom-6 z-20 px-8 py-5 bg-slate-950/90 border-2 border-sky-600/30 rounded-[32px] flex flex-col sm:flex-row justify-between items-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-white font-black text-[14px] md:text-[16px] tracking-tighter">Submit assessment?</p>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[1px]">{Object.keys(fullTestAnswers).length} / {fullQuiz.length} markers synced</p>
                      </div>
                      <button
                        onClick={() => {
                          if (currentFullTestStep + 1 < (fullQuiz || []).length) {
                            setCurrentFullTestStep(c => c + 1);
                          } else {
                            setShowFullResults(true);
                          }
                        }}
                        className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-[2px] text-[11px] text-slate-500 border-2 border-slate-800 bg-transparent hover:border-slate-600 hover:text-white transition-all flex items-center justify-center gap-3 group"
                      >
                        <Forward size={16} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                        Skip Node
                      </button>
                      <button
                        onClick={() => {
                          if (currentFullTestStep + 1 < (fullQuiz || []).length) {
                            setCurrentFullTestStep(c => c + 1);
                          } else {
                            setShowFullResults(true);
                          }
                        }}
                        disabled={fullTestAnswers[currentFullTestStep] === undefined}
                        className="w-full sm:w-auto px-12 py-5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black text-[13px] uppercase tracking-[2px] transition-all shadow-2xl flex items-center justify-center gap-3 group disabled:opacity-30 disabled:cursor-not-allowed border-none"
                      >
                        {currentFullTestStep + 1 < (fullQuiz || []).length ? "Next Node" : "Finalize Mission"}
                        <ChevronRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-12 text-center p-16 border border-slate-800 rounded-[64px] bg-slate-950 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-fade-up px-8">
                      <div className="absolute inset-0 bg-sky-600/5 blur-[120px] rounded-full pointer-events-none" />
                      <div className="text-slate-500 font-black text-[10px] uppercase tracking-[8px] mb-8">Assessment Finalized</div>
                      <p className="text-7xl font-black text-white tracking-tighter mb-12">
                        <span className="text-sky-500">{Object.keys(fullTestAnswers).filter(k => fullTestAnswers[parseInt(k)] === (fullQuiz || [])[parseInt(k)].correctAnswer).length}</span>
                        <span className="text-slate-800 mx-4">/</span>
                        {(fullQuiz || []).length}
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <button
                          onClick={() => { setShowFullResults(false); setFullTestAnswers({}); setCurrentFullTestStep(0); }}
                          className="w-full sm:w-auto px-12 py-5 rounded-2xl border border-slate-700 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:border-sky-500 hover:text-white transition-all shadow-xl"
                        >
                          Restart Sequence
                        </button>
                        <button
                          onClick={() => setShowFullTestModal(false)}
                          className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-xl"
                        >
                          Return to Terminal
                        </button>
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

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center bg-slate-950 min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
      <p className="text-sky-500 font-bold uppercase tracking-[4px] animate-pulse">Syncing Strategic Nodes...</p>
    </div>}>
      <NewsContent />
    </Suspense>
  );
}