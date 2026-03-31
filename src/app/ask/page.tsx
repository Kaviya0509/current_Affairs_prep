"use client";
import { useState } from "react";
import { AIAnalysisResponse } from "@/types";
import Link from "next/link";

export default function AskPage() {
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await fetch("/api/ask", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setReport(data.analysis);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fade-up">
      <header className="mb-10 text-center">
        <h1 className="font-display text-[32px] font-bold text-slate-900 mb-3 tracking-tight">AI Intelligence Engine</h1>
        <p className="text-[15px] font-medium text-slate-500">Instant cross-referencing and strategic analysis of global banking news</p>
      </header>

      {/* Query Bar */}
      <div className="bg-white rounded-[28px] p-2 mb-10 shadow-lg border border-slate-100 flex items-center ring-1 ring-slate-200">
        <form onSubmit={handleAsk} className="flex flex-1 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Interrogate today's intelligence (e.g., 'Impact of FDI norms on retail banking')"
            className="flex-1 bg-transparent px-8 py-4 text-[15px] font-bold text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-10 py-4 rounded-[22px] font-bold text-[14px] transition-all hover:bg-slate-800 disabled:opacity-50 shadow-md active:scale-95"
          >
            {loading ? "Processing..." : "Search Analysis"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="h-40 bg-slate-50 rounded-[28px] animate-pulse border border-slate-100" />
          <div className="h-64 bg-slate-50 rounded-[28px] animate-pulse border border-slate-100" />
        </div>
      )}

      {report && (
        <div className="space-y-8 animate-fade-in">
          {/* Executive Summary */}
          <section className="bg-white rounded-[28px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 opacity-5" />
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Strategic Assessment Brief</h2>
            <p className="text-[18px] leading-relaxed text-slate-800 font-medium italic">
              &quot;{report.summary}&quot;
            </p>
          </section>

          {/* Analysis Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-5">Key Critical Points</h3>
              <ul className="space-y-5">
                {report.keyPoints.map((point: string, i: number) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="text-[12px] font-bold text-blue-200 mt-0.5">{(i + 1).toString().padStart(2, "0")}</span>
                    <p className="text-[14.5px] leading-relaxed text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{point}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-[28px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-5">Sectoral Implications</h3>
              <p className="text-[14.5px] leading-relaxed text-slate-700 font-medium bg-amber-50/30 p-6 rounded-2xl border border-amber-100/50">
                {report.implications}
              </p>
            </div>
          </div>

          {/* References */}
          <section className="pt-8 border-t border-slate-100">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Verified Information Nodes</h3>
            <div className="flex flex-wrap gap-3">
              {report.references.map((ref: string, i: number) => (
                <div
                  key={i}
                  className="px-5 py-3 rounded-full bg-slate-50 border border-slate-100 text-[12px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {ref}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
