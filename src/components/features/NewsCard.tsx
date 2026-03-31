"use client";
import { useState } from "react";
import { NewsArticle, QuizQuestion } from "@/types";
import { CATEGORY_CONFIG, timeAgo } from "@/lib/utils";
import { X, ExternalLink, Calendar, Tag, Brain, Play, CheckCircle2, ChevronRight, Zap, ShieldCheck } from "lucide-react";

interface Props {
  article: NewsArticle;
  compact?: boolean;
}

const ACCENT_COLORS = [
  "#38bdf8", // Sky
  "#818cf8", // Indigo
  "#fb7185", // Rose
  "#34d399", // Emerald
  "#fbbf24", // Amber
  "#a78bfa", // Violet
];

export default function NewsCard({ article, compact }: Props) {
  const [open, setOpen] = useState(false);
  
  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [keyPoints, setKeyPoints] = useState<string[] | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz Interaction State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Pick a stable color based on article ID
  const colorIdx = article.id ? (article.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % ACCENT_COLORS.length) : 0;
  const accent = ACCENT_COLORS[colorIdx];

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      const res = await fetch("/api/analyze-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article }),
      });
      if (!res.ok) throw new Error("Failed to analyze article.");
      const data = await res.json();
      setKeyPoints(data.keyPoints || []);
      setQuiz(data.quiz || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleQuizSubmit = () => setShowResults(true);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .crypto-card { 
          background: #fff; border-radius: 24px; overflow: hidden;
          border: 1.5px solid transparent; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03); 
          display: flex; flex-direction: column; cursor: pointer;
        }
        .crypto-card:hover { 
          transform: translateY(-8px) scale(1.01); 
          box-shadow: 0 30px 60px rgba(0,0,0,0.08);
          border-color: ${accent};
        }
        .crypto-card:hover .halo-glow { opacity: 0.1; }
        .halo-glow { 
          position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, ${accent} 0%, transparent 70%);
          opacity: 0; transition: opacity 0.5s; pointer-events: none;
        }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />

      <div className="crypto-card relative group" onClick={() => setOpen(true)}>
        <div className="halo-glow" />
        
        {/* Compact Header Image */}
        <div className="relative h-20 w-full overflow-hidden bg-slate-50">
          {article.urlToImage ? (
            <img src={article.urlToImage} alt="" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-200">
               <Zap size={24} fill="currentColor" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent" />
          <div className="absolute top-3 left-4 flex gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md shadow-sm border border-slate-100/50" style={{ color: accent }}>
               {article.category}
            </span>
          </div>
        </div>

        {/* Content Node */}
        <div className="p-6 pt-2">
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: accent }} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{article.examRelevance} Relevance</span>
          </div>
          
          <h3 className="font-display text-[15.5px] font-black text-slate-900 leading-tight mb-3 line-clamp-2 transition-colors">
            {article.title}
          </h3>

          {!compact && (
            <p className="text-[12px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4">
              {article.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{article.source.name}</span>
              <span className="text-[9px] font-bold text-slate-400">{timeAgo(article.publishedAt)}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
               <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ── High-Fidelity Intelligence Drawer ── */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end px-4 md:px-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          
          <div className="relative z-10 w-full max-w-2xl h-[95vh] mt-[2.5vh] md:h-screen md:mt-0 bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right md:rounded-l-[40px]">
            {/* Header Module */}
            <div className="p-8 md:p-12 border-b border-slate-50 bg-white sticky top-0 z-10">
              <div className="flex justify-between items-start mb-8 text-slate-400">
                <button onClick={() => setOpen(false)} className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] hover:text-slate-950 transition-colors">
                   <X size={16} /> Close Terminal
                </button>
                <div className="flex items-center gap-2">
                   <ShieldCheck size={14} className="text-emerald-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none">Verified Intel Node</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">
                   {article.category}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                   {article.examRelevance} Priority
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-[1.1] md:pr-12">
                {article.title}
              </h2>
            </div>

            {/* Scrollable Intelligence Stream */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-slate-50/20">
              {/* AI Strategic Analysis Button */}
              {!keyPoints && !analyzing && (
                <div className="p-10 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group/cta cursor-pointer" onClick={handleAnalyze}>
                   <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                         <Brain size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-black mb-2">Initialize Strategic Analysis</h3>
                      <p className="text-slate-400 text-sm font-medium mb-8 max-w-sm">Extract high-yield exam points and generate a custom performance assessment based on this dossier.</p>
                      <button className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 hover:text-white transition-all">
                         Launch Analysis
                      </button>
                   </div>
                   <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-[80px]" />
                </div>
              )}

              {analyzing && (
                <div className="py-20 text-center space-y-6">
                   <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center text-white mx-auto animate-pulse">
                      <Brain size={32} className="animate-bounce" />
                   </div>
                   <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 mb-1">Processing Intelligence</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cross-referencing exam metrics...</p>
                   </div>
                </div>
              )}

              {keyPoints && (
                <div className="space-y-8 animate-fade-up">
                   <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                         <CheckCircle2 size={18} className="text-emerald-500" /> Key Intelligence Points
                      </h3>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {keyPoints.map((p, i) => (
                        <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 flex gap-6 group hover:border-slate-300 transition-all">
                           <span className="text-2xl font-black text-slate-200 group-hover:text-slate-900 transition-colors pt-1">0{i+1}</span>
                           <p className="text-[15px] font-medium text-slate-600 group-hover:text-slate-900 leading-relaxed">{p}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {quiz && (
                 <div className="space-y-8 pb-20 animate-fade-up">
                    <div className="border-b border-slate-200 pb-4">
                       <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                          <Zap size={18} className="text-amber-500 fill-amber-500" /> Assessment Module
                       </h3>
                    </div>
                    {quiz.map((q, qidx) => (
                       <div key={qidx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                          <p className="text-lg font-black text-slate-900 mb-8 leading-tight">{q.question}</p>
                          <div className="grid grid-cols-1 gap-3">
                             {q.options.map((opt, oidx) => {
                                const isSelected = userAnswers[qidx] === oidx;
                                const isCorrect = showResults && q.correctAnswer === oidx;
                                const isWrong = showResults && isSelected && !isCorrect;
                                return (
                                   <button 
                                      key={oidx}
                                      disabled={showResults}
                                      onClick={() => setUserAnswers(prev => ({ ...prev, [qidx]: oidx }))}
                                      className={`p-5 text-left rounded-2xl border-2 transition-all font-bold text-[14px] flex items-center gap-4 ${
                                         isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                                         isWrong ? "bg-rose-50 border-rose-500 text-rose-900" :
                                         isSelected ? "bg-slate-950 border-slate-950 text-white" :
                                         "bg-slate-50 border-transparent text-slate-600 hover:border-slate-300"
                                      }`}
                                   >
                                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black border-2 ${
                                         isSelected ? "bg-white/20 border-white/30" : "bg-white border-slate-100"
                                      }`}>
                                         {String.fromCharCode(65+oidx)}
                                      </span>
                                      {opt}
                                   </button>
                                );
                             })}
                          </div>
                          {showResults && (
                             <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-l-4 border-slate-900">
                                <p className="text-[10px] font-black uppercase tracking-widest mb-2">Dossier Explanation</p>
                                <p className="text-[13px] font-medium text-slate-600 leading-relaxed">{q.explanation}</p>
                             </div>
                          )}
                       </div>
                    ))}
                    {!showResults && (
                       <button 
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(userAnswers).length < quiz.length}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-30 transition-all shadow-xl"
                       >
                          Finalize Terminal Report
                       </button>
                    )}
                 </div>
              )}

              {/* Original Document Section */}
              <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 space-y-6">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Primary Intelligence Brief</p>
                 <div className="prose prose-slate max-w-none">
                    {article.content ? (
                      <div className="text-slate-600 font-medium leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: article.content }} />
                    ) : (
                      <p className="text-slate-600 font-medium leading-relaxed text-lg">{article.description}</p>
                    )}
                 </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-8 border-t border-slate-50 bg-white/80 backdrop-blur-md flex gap-4">
              <a href={article.url} target="_blank" className="flex-1 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-[12px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                 Read Primary Source <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
