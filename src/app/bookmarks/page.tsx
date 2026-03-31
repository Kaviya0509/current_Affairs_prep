"use client";
import { useState } from "react";
import { NewsArticle } from "@/types";

const MOCK: NewsArticle[] = [
  {
    id: "bm-1",
    title: "RBI Keeps Repo Rate Unchanged at 6.5%",
    description: "The Monetary Policy Committee unanimously decided to hold the repo rate steady amid inflation concerns.",
    content: "",
    url: "https://rbi.org.in",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    source: { id: null, name: "RBI Bulletin" },
    category: "banking",
    examRelevance: "high",
  },
  {
    id: "bm-2",
    title: "India's GDP Growth Estimated at 7.2% for FY2025-26",
    description: "NSO second advance estimate projects strong growth driven by manufacturing and services.",
    content: "",
    url: "https://pib.gov.in",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    source: { id: null, name: "PIB India" },
    category: "economy",
    examRelevance: "high",
  },
];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState(MOCK);
  const [search, setSearch] = useState("");

  const remove = (id: string) => setBookmarks((b) => b.filter((a) => a.id !== id));

  const filtered = bookmarks.filter((b) =>
    search ? b.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="max-w-6xl mx-auto py-10 animate-fade-up space-y-10">
      {/* Header */}
      <header className="flex items-end justify-between border-b border-slate-100 pb-8 px-2">
        <div>
          <h1 className="font-display text-[32px] font-bold text-slate-900 tracking-tight leading-none mb-3">
            Knowledge Library
          </h1>
          <p className="text-[15px] text-slate-500 font-medium">{bookmarks.length} retained intelligence nodes</p>
        </div>
        <button
          onClick={() => setBookmarks([])}
          className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all active:scale-95"
        >
          Purge Library
        </button>
      </header>

      {/* Interrogation Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm ring-1 ring-slate-200 max-w-xl">
        <div className="flex-1 flex items-center gap-4 bg-slate-50/50 px-6 py-3.5 rounded-2xl border border-slate-100 shadow-inner">
          <input
            type="text"
            placeholder="Locate intelligence nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-40 text-center bg-slate-50/50 rounded-[40px] border border-slate-100 border-dashed">
          <p className="text-slate-400 font-bold uppercase text-[12px] tracking-[0.3em]">Library is currently empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((a) => (
            <div key={a.id} className="group flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-500">
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-8">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] border border-slate-100 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100">
                    {a.category}
                  </span>
                  <button
                    onClick={() => remove(a.id)}
                    className="text-[10px] font-bold text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                  >
                    Discard
                  </button>
                </div>
                <h3 className="font-display text-[19px] font-bold text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                  {a.title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium line-clamp-3">
                  {a.description}
                </p>
              </div>
              <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 rounded-b-[32px] flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Saved node</span>
                <a
                  href={a.url}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                >
                  Reference &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
