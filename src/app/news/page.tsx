"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NewsArticle, NewsCategory, QuizQuestion } from "@/types";
import { Brain, Play, CheckCircle2, X, MessageCircle, Send, Sparkles, Loader2, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

  // Full Test States
  const [showFullTestModal, setShowFullTestModal] = useState(false);
  const [fullQuiz, setFullQuiz] = useState<QuizQuestion[] | null>(null);
  const [analyzingFull, setAnalyzingFull] = useState(false);
  const [fullTestAnswers, setFullTestAnswers] = useState<Record<number, number>>({});
  const [showFullResults, setShowFullResults] = useState(false);
  const [fullTestError, setFullTestError] = useState<string | null>(null);

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const openArticle = (a: NewsArticle) => {
    setSelectedArticle(a);
    setKeyPoints(null);
    setQuiz(null);
    setShowResults(false);
    setUserAnswers({});
    setQuizError(null);
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

  const handleChat = async (overrideMsg?: string) => {
    const messageToSend = overrideMsg || chatInput;
    if (!messageToSend.trim() || chatLoading) return;
    const userMsg = messageToSend.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: chatHistory.slice(-4) })
      });
      if (!res.ok) throw new Error("Connection failed.");
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "📡 Connection unstable. Unable to reach intelligence node." }]);
    } finally {
      setChatLoading(false);
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

  useEffect(() => {
    // Check if we should auto-start the test from query param
    const autoStart = searchParams.get("startTest") === "true";
    if (autoStart && !loading && articles.length > 0) {
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
              <h2 className="text-2xl font-black text-white tracking-tighter mb-1">
                {period === 'day' ? 'Today\'s' : period === 'week' ? 'Weekly' : 'Monthly'} Mega Intelligence Assessment
              </h2>
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
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
                <div className="py-10 px-8 rounded-[32px] bg-sky-600/5 border border-sky-400/20 text-center">
                  <Brain size={44} className="text-sky-500 mx-auto mb-6 shadow-sky-500/20" />
                  <h3 className="text-white font-black text-[22px] md:text-[24px] mb-3 tracking-tighter">Deep Intelligence Analysis</h3>
                  <p className="text-slate-400 font-medium text-[14px] mb-8 max-w-md mx-auto leading-relaxed">Let our AI dissect this report, identify core exam pointers, and build high-fidelity assessment vectors for you.</p>
                  <button onClick={handleAnalyze} className="px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-[13px] uppercase tracking-[3px] transition-all shadow-xl shadow-sky-600/20">
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
                  <h3 className="text-white font-black text-[16px] md:text-[18px] uppercase tracking-[2px] mb-1 flex items-center gap-3 relative z-10">
                    <Brain size={20} className="text-sky-500" /> Dossier Assessment
                  </h3>
                  <p className="text-slate-500 mb-8 text-[11px] font-black uppercase tracking-widest relative z-10">Neural Fidelity Validation</p>

                  <div className="space-y-12 relative z-10">
                    {quiz.map((q, qIndex) => (
                      <div key={qIndex} className="animate-fade-up" style={{ animationDelay: `${qIndex * 0.1}s` }}>
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
                    ))}
                  </div>

                  {!showResults ? (
                    <div className="flex flex-col gap-4 mt-12 relative z-10">
                      <button
                        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setShowResults(true); }}
                        disabled={Object.keys(userAnswers).length < quiz.length}
                        className="w-full py-4 rounded-xl font-black uppercase tracking-[3px] text-[12px] text-white transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed bg-sky-600 hover:bg-sky-500"
                      >
                        {Object.keys(userAnswers).length < quiz.length ? `Resolve ${quiz.length - Object.keys(userAnswers).length} more to submit` : "Submit Dossier Assessment"}
                      </button>

                      <button
                        onClick={handleLoadMoreQuiz}
                        disabled={analyzing}
                        className="w-full py-4 rounded-xl font-black uppercase tracking-[2px] text-[11px] text-slate-400 border border-slate-700 bg-slate-950/40 hover:bg-slate-900 transition-all"
                      >
                        {analyzing ? 'HARVESTING DATA...' : 'REINFORCE WITH MORE QUESTIONS (+)'}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-12 p-8 border border-slate-700 rounded-3xl bg-slate-950/60 text-center relative z-10 flex flex-col gap-4">
                      <div className="text-slate-500 font-black text-[11px] uppercase tracking-[4px]">Mission Report</div>
                      <p className="font-black text-[36px] text-white tracking-tighter">
                        {Object.keys(userAnswers).filter(k => userAnswers[parseInt(k)] === quiz[parseInt(k)].correctAnswer).length} <span className="text-slate-600">/</span> {quiz.length}
                      </p>
                      <button
                        onClick={() => { setShowResults(false); setUserAnswers({}); handleLoadMoreQuiz(); }}
                        className="text-[12px] font-black text-sky-400 uppercase tracking-[3px] hover:text-white transition-colors py-3 border border-sky-500/30 rounded-xl bg-sky-500/5 hover:bg-sky-500/20"
                      >
                        Retrain & Load New Questions
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
                    className="group relative px-10 py-5 bg-sky-600 hover:bg-sky-500 text-white rounded-[24px] font-black text-[14px] md:text-[16px] uppercase tracking-[3px] md:tracking-[4px] transition-all shadow-xl shadow-sky-600/30"
                  >
                    Initialize Test
                  </button>
                  {fullTestError && <p className="text-red-400 mt-12 text-[15px] font-black bg-red-950/30 p-6 rounded-[32px] border-2 border-red-900/50">{fullTestError}</p>}
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

                  <div className="space-y-24 pb-32">
                    {fullQuiz.map((q, qIdx) => {
                      const accent = MODAL_ACCENTS[qIdx % MODAL_ACCENTS.length];
                      return (
                        <div key={qIdx} className="group animate-fade-up">
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
                    })}
                  </div>

                  {!showFullResults ? (
                    <div className="sticky bottom-6 z-20 px-8 py-5 bg-slate-950/90 border-2 border-sky-600/30 rounded-[32px] flex flex-col sm:flex-row justify-between items-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-white font-black text-[14px] md:text-[16px] tracking-tighter">Submit assessment?</p>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[1px]">{Object.keys(fullTestAnswers).length} / {fullQuiz.length} markers synced</p>
                      </div>
                      <button
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setShowFullResults(true);
                        }}
                        className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-[12px] uppercase tracking-[2px] transition-all"
                        suppressHydrationWarning
                      >
                        Grade Mission
                      </button>
                    </div>
                  ) : (
                    <div className="pb-40 text-center">
                      <button
                        onClick={() => setShowFullTestModal(false)}
                        className="px-16 py-6 bg-slate-950 border-2 border-sky-600 text-white rounded-[32px] font-black text-[16px] uppercase tracking-[6px] hover:bg-slate-900 transition-all"
                      >
                        Return to Hub
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CHAT WIDGET */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-sky-600/30 z-[110] transition-all group scale-in"
      >
        {isChatOpen ? <X size={24} /> : <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[550px] max-h-[75vh] bg-slate-900 border border-slate-700/50 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.9)] z-[110] flex flex-col overflow-hidden animate-fade-up backdrop-blur-3xl ring-1 ring-white/5">
          {/* PROFESSIONAL HEADER */}
          <div className="p-6 pb-4 border-b border-white/5 bg-gradient-to-br from-sky-600/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-600/30">
                  <Sparkles size={20} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-black text-[14px] uppercase tracking-[2px]">Neural Node</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <p className="text-sky-400/60 text-[9px] font-black uppercase tracking-widest">Active Intelligence</p>
                </div>
              </div>
            </div>
          </div>

          {/* TOPIC SELECTION ROW */}
          <div className="px-6 py-4 bg-slate-900/40 border-b border-white/5">
            <p className="text-slate-500 font-black text-[8.5px] uppercase tracking-[2px] mb-3">Topic Context</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Briefing", cmd: "Summarize today's news briefly.", color: "sky" },
                { label: "Banking", cmd: "Quiz me on today's Banking & Finance intelligence.", color: "blue" },
                { label: "Economy", cmd: "Quiz me on today's Economy & GDP intelligence.", color: "emerald" },
                { label: "National", cmd: "Quiz me on today's National & Govt Affairs intelligence.", color: "purple" }
              ].map(t => (
                <button
                  key={t.label}
                  onClick={() => handleChat(t.cmd)}
                  className={`px-3 py-1.5 rounded-lg bg-${t.color}-500/10 border border-${t.color}-500/20 text-${t.color}-400 text-[9px] font-black uppercase tracking-wider hover:bg-${t.color}-600 hover:text-white transition-all`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 bg-slate-800/40 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Brain className="text-sky-500" size={32} />
                </div>
                <h5 className="text-white font-black text-[18px] mb-3 tracking-tighter">Mission Readiness</h5>
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-[240px] mx-auto">Instant language assessment for the intelligence dossier.</p>
              </div>
            ) : (
              chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                  <div className={`max-w-[92%] p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-lg ${m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none shadow-sky-600/10'
                    : 'bg-slate-800/50 text-slate-200 border border-white/5 rounded-bl-none'
                    }`}>
                    <div className="chat-markdown">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-slate-800/30 p-6 rounded-[32px] border border-white/5 flex gap-3">
                  <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-6 border-t border-white/5 bg-slate-950/40">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Tactical Query..."
                className="w-full bg-slate-900 border-2 border-white/5 focus:border-sky-500/30 rounded-2xl py-4 px-6 pr-16 text-[13.5px] text-white outline-none transition-all placeholder:text-slate-600 font-bold"
              />
              <button
                onClick={() => handleChat()}
                className="absolute right-3 w-10 h-10 bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-xl transition-all scale-90 group-focus-within:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading Terminal...</div>}>
      <NewsContent />
    </Suspense>
  );
}
