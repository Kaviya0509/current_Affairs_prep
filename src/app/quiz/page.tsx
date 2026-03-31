"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { QuizQuestion, NewsCategory } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Phase = "setup" | "active" | "result";

function QuizContent() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get("category") as NewsCategory | "all" | null;
  
  const [phase, setPhase] = useState<Phase>("setup");
  const [category, setCategory] = useState<NewsCategory | "all">(initCat || "all");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [exam, setExam] = useState<"Banking" | "SSC" | "UPSC" | "TNPSC">("Banking");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    try {
      setLoading(true); setError(null);
      const url = `/api/quiz?count=${count}&difficulty=${difficulty}&period=${period}&exam=${exam}${category !== "all" ? `&category=${category}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setQuestions(data.questions);
      setCurrent(0); setSelected(null); setAnswers([]);
      setPhase("active");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (selected === null) return;
    const isCorrect = selected === questions[current].correctAnswer;
    setAnswers((p) => [...p, { correct: isCorrect, selected }]);
    if (current + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  const score = answers.filter((a) => a.correct).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  // ── Setup ──
  if (phase === "setup") return (
    <div className="max-w-xl mx-auto py-12 animate-fade-up">
      <div className="text-center mb-10">
        <h1 className="font-display text-[32px] font-bold text-slate-900 mb-2">AI Assessment Hub</h1>
        <p className="text-[14px] text-slate-500 font-medium">Generate custom mock tests using live AffairsCloud intelligence</p>
      </div>

      <div className="rounded-[24px] p-8 space-y-8 glass-card">
        <div className="space-y-4">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Exam Type Focus</label>
          <div className="grid grid-cols-4 gap-2">
            {["Banking", "SSC", "UPSC", "TNPSC"].map((e) => (
              <button
                key={e}
                onClick={() => setExam(e as any)}
                className="py-3 rounded-xl text-[12px] font-bold border transition-all active:scale-95 shadow-sm"
                style={
                  exam === e
                    ? { background: "#0f172a", color: "#fff", borderColor: "#0f172a" }
                    : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }
                }
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Category Focus</label>
          <div className="grid grid-cols-2 gap-3">
            {["economy", "banking", "general", "international"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c as any)}
                className="py-3.5 rounded-xl text-[13px] font-bold capitalize border transition-all active:scale-95 shadow-sm"
                style={
                  category === c
                    ? { background: "#0f172a", color: "#fff", borderColor: "#0f172a" }
                    : { background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Period & Volume</label>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="grid grid-cols-3 gap-2 flex-1">
               {["day", "week", "month"].map((p) => (
                 <button
                   key={p}
                   onClick={() => setPeriod(p as any)}
                   className="py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all active:scale-95"
                   style={
                     period === p
                       ? { background: "#10b981", borderColor: "#059669", color: "#fff" }
                       : { background: "#f8fafc", borderColor: "#e2e8f0", color: "#64748b" }
                   }
                 >
                   {p}
                 </button>
               ))}
             </div>
             <div className="grid grid-cols-3 gap-2 sm:w-[40%]">
               {[10, 25, 50].map((c) => (
                 <button
                   key={c}
                   onClick={() => setCount(c)}
                   className="py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all active:scale-95"
                   style={
                     count === c
                       ? { background: "#3b82f6", borderColor: "#2563eb", color: "#fff" }
                       : { background: "#f8fafc", borderColor: "#e2e8f0", color: "#64748b" }
                   }
                 >
                   {c} MCQs
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-widest pl-1">Complexity Level</label>
          <div className="grid grid-cols-3 gap-3">
            {["easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d as any)}
                className="py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest border transition-all active:scale-95"
                style={
                  difficulty === d
                    ? { background: "#f1f5f9", borderColor: "#334155", color: "#0f172a" }
                    : { background: "#fff", borderColor: "#f1f5f9", color: "#94a3b8" }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-4 rounded-xl font-bold text-[14px] transition-all bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-md"
        >
          {loading ? "Generating Assessment..." : "Generate Analysis Briefing"}
        </button>
      </div>
    </div>
  );

  // ── Active ──
  if (phase === "active") {
    const q = questions[current];
    return (
      <div className="max-w-3xl mx-auto py-12 animate-fade-up px-6">
        {/* Top CBT Status Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-end text-[13px] mb-3">
            <div className="flex flex-col gap-1">
               <span className="font-bold text-slate-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                 LIVE NODE ASSESSMENT
               </span>
               <span className="font-black text-slate-900 text-[18px] tracking-tight">Intelligence Node {current + 1} / {questions.length}</span>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
               <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Current Trajectory</span>
               <span className="font-black text-indigo-600 text-[18px] bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                 Score: {score}
               </span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
            <div
              className="h-full bg-slate-900 transition-all duration-700 ease-out relative"
              style={{ width: `${((current) / questions.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Question Card with Glassmorphism */}
        <div className="rounded-[40px] p-10 md:p-12 bg-white border border-slate-200 shadow-[0_30px_60px_rgba(15,23,42,0.06)] relative overflow-hidden group/card">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <span className="font-display text-[150px] leading-none font-black text-slate-900 select-none">Q{current+1}</span>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="text-[11px] px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20">
                {q.category}
              </span>
              <span className="text-[11px] px-3.5 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 font-bold uppercase tracking-[0.2em]">
                {q.difficulty}
              </span>
            </div>

            <p className="font-display text-[26px] md:text-[32px] font-bold text-slate-900 leading-tight mb-12">
              {q.question}
            </p>

            <div className="grid grid-cols-1 gap-4">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctAnswer;
                const isSelected = i === selected;
                const revealed = selected !== null;

                let style: any = { background: "#fff", borderColor: "#e2e8f0", color: "#334155" };
                
                if (revealed) {
                  if (isCorrect) style = { background: "#ecfdf5", borderColor: "#10b981", color: "#065f46", ring: "ring-4 ring-emerald-50" };
                  else if (isSelected) style = { background: "#fef2f2", borderColor: "#ef4444", color: "#991b1b", ring: "ring-4 ring-red-50" };
                  else if (!isCorrect) style = { background: "#f8fafc", borderColor: "#e2e8f0", color: "#94a3b8", opacity: 0.6 };
                } else if (isSelected) {
                  style = { background: "#f8fafc", borderColor: "#334155", color: "#0f172a" };
                }

                return (
                  <button
                    key={i}
                    disabled={revealed}
                    onClick={() => setSelected(i)}
                    className={`w-full p-6 text-left rounded-2xl text-[16px] font-semibold border-2 transition-all flex items-center justify-between group shadow-sm ${style.ring || ""} hover:border-slate-400 hover:shadow-md active:scale-[0.98]`}
                    style={style}
                  >
                    <div className="flex items-center gap-5">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black border-2 transition-colors" 
                            style={{ 
                              background: isSelected || (revealed && isCorrect) ? "var(--text-main)" : "#fff", 
                              color: isSelected ? "var(--white)" : "inherit", 
                              borderColor: "inherit" 
                            }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </div>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="mt-10 pt-10 border-t-2 border-dashed border-slate-200 animate-fade-up">
                <div className="p-8 rounded-[24px] bg-slate-900 text-white mb-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Executive Briefing
                  </p>
                  <p className="text-[15.5px] leading-relaxed font-medium text-slate-100">{q.explanation}</p>
                </div>
                <button
                  onClick={next}
                  className="w-full h-16 rounded-2xl font-black bg-white border border-slate-200 text-slate-900 text-[15px] uppercase tracking-widest hover:border-slate-900 hover:bg-slate-50 shadow-xl shadow-slate-200/50 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {current === questions.length - 1 ? "Finalize Terminal Report" : "Proceed to Next Node"} 
                  <span className="text-xl">→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Result ──
  return (
    <div className="max-w-2xl mx-auto py-16 animate-fade-up px-6">
      <div className="bg-white border border-slate-200 rounded-[48px] p-16 text-center shadow-[0_30px_60px_rgba(15,23,42,0.06)] relative overflow-hidden">
        {/* Confetti / abstract glowing elements */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20 ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-red-500'}`} />
        
        <div className="relative z-10">
          <div className={`w-40 h-40 rounded-[32px] mx-auto mb-10 shadow-2xl flex items-center justify-center rotate-3 border-8 border-white ${pct >= 80 ? 'bg-emerald-500 shadow-emerald-500/30' : pct >= 60 ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
            <span className="text-[48px] font-black text-white -rotate-3">{pct}%</span>
          </div>
          
          <h2 className="font-display text-[40px] font-black text-slate-900 mb-3 tracking-tight">Performance Matrix</h2>
          <p className="text-[16px] font-medium text-slate-500 mb-12">Analyzed <strong className="text-slate-900">{questions.length}</strong> strategic intelligence nodes from {exam} metrics.</p>

          <div className="space-y-4 mb-16 max-w-sm mx-auto">
            <button
              onClick={() => { setPhase("setup"); setAnswers([]); }}
              className="w-full h-16 rounded-2xl font-black bg-slate-900 text-white uppercase tracking-widest text-[13px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              Initiate New Cycle
            </button>
            <Link
              href="/"
              className="flex items-center justify-center w-full h-16 rounded-2xl font-black text-slate-700 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all uppercase tracking-widest text-[13px] active:scale-95"
            >
              Return to Terminal
            </Link>
          </div>
          
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border border-slate-200 bg-white shadow-sm`}>
             <span className={`w-2 h-2 rounded-full animate-ping ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-red-500'}`} />
             <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
               {pct >= 80 ? "Operational Readiness Verified" : pct >= 60 ? "Proficiency Within Acceptable Parameters" : "Extended Archival Review Mandated"}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading Assessment Engine...</div>}>
      <QuizContent />
    </Suspense>
  );
}
