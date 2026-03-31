"use client";
import { useEffect, useState } from "react";
import { fetchCurrentAffairs, Article, filterByWeek, filterByMonth } from "@/lib/fetchCurrentAffairs";
import {
  Download,
  Printer,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Zap,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";

export default function DigestPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [open, setOpen] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCurrentAffairs();
        // The fetchCurrentAffairs returns all recent items, we filter them here
        let filtered = data;
        if (period === "day") {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          filtered = data.filter(a => new Date(a.pubDate) >= dayAgo);
        } else if (period === "week") {
          filtered = filterByWeek(data);
        } else if (period === "month") {
          filtered = filterByMonth(data);
        }
        setArticles(filtered);

        // Auto-open unique categories
        const cats = Array.from(new Set(filtered.map(a => a.category)));
        setOpen(cats.slice(0, 2));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  const toggle = (key: string) => {
    setOpen((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const grouped = articles.reduce((acc, a) => {
    const cat = a.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {} as Record<string, Article[]>);

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-8 py-12 animate-fade-up">
      <div className="flex items-center gap-6 mb-8 px-4">
        <div className="h-16 w-16 bg-slate-100 rounded-[24px] animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-8 w-1/3 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-slate-50 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-40 bg-slate-50 rounded-[48px] border border-slate-100 animate-pulse mx-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
        <div className="h-64 bg-slate-50 rounded-[40px] border border-slate-100 animate-pulse" />
        <div className="h-64 bg-slate-50 rounded-[40px] border border-slate-100 animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 animate-fade-up print:py-0 print:max-w-full print:bg-white px-4">
      {/* Strategic Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between border-b-2 border-slate-900 pb-12 gap-8 print:hidden">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-300">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="font-display text-[40px] md:text-[48px] font-black text-slate-900 tracking-tighter leading-none mb-1">
                {period === "month" ? "Monthly Intelligence Dossier" : "Consolidated Intelligence Feed"}
              </h1>
              <p className="text-[14px] md:text-[16px] text-slate-500 font-bold tracking-tight capitalize flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" /> DIRECT NODE SYNC • AFFAIRSCLOUD SPECIALIZED POD
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-full sm:w-auto">
            {["day", "week", "month"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as any)}
                className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${period === p
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-400 scale-[1.05] relative z-10"
                    : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 h-14 px-10 rounded-2xl bg-slate-900 text-white text-[14px] font-black hover:bg-slate-800 transition-all shadow-[0_20px_40px_rgba(15,23,42,0.15)] active:scale-95"
          >
            <Download size={20} /> <span className="uppercase tracking-widest leading-none">Export intelligence pack</span>
          </button>
        </div>
      </header>

      {/* Front Page for Print-only (Monthly Pack) */}
      {period === "month" && (
        <div className="hidden print:block h-[1000px] border-[20px] border-slate-900 p-24 text-center mb-[100px] relative">
          <div className="absolute top-10 right-10 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">
            AX-7-910 DEEP ARCHIVE
          </div>
          <div className="flex justify-center mt-32 mb-20">
            <div className="w-36 h-36 rounded-[48px] bg-slate-900 flex items-center justify-center text-white shadow-2xl">
              <ShieldCheck size={84} strokeWidth={1} />
            </div>
          </div>
          <h1 className="text-[84px] font-black text-slate-900 leading-[0.9] tracking-tighter mb-12">
            MONTHLY<br />BANKING & ECONOMY<br />DOSSier
          </h1>
          <div className="inline-block px-12 py-5 bg-slate-900 text-white text-[28px] font-black uppercase tracking-[0.3em] mb-20">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <div className="max-w-2xl mx-auto border-y-2 border-slate-900 py-10 mb-60">
            <p className="text-[20px] font-bold text-slate-900 uppercase tracking-widest mb-4">Official Publication</p>
            <p className="text-[16px] font-bold text-slate-600 leading-relaxed italic">
              &quot;Specialized current affairs feed for professional banking and civil services aspirants. Compiled from primary intelligence nodes.&quot;
            </p>
          </div>
          <div className="flex justify-between items-end text-left border-t-8 border-slate-900 pt-10">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Primary Sync Nodes</p>
              <p className="text-[18px] font-black text-slate-900">AFFAIRSCLOUD.com</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Terminal Identity</p>
              <p className="text-[18px] font-black text-slate-900 leading-none">BANKPREP STRATEGIC UNIT</p>
            </div>
          </div>
        </div>
      )}

      {articles.length > 0 ? (
        <div className="space-y-20 pt-16 print:pt-10">
          {/* Summary Indicator */}
          <section className="bg-slate-900 rounded-[56px] p-16 text-white relative overflow-hidden shadow-2xl print:p-8 print:rounded-3xl print:bg-white print:text-slate-900 print:border-4 print:border-slate-900">
            <div className="absolute top-10 right-10 text-emerald-400 opacity-20 print:hidden">
              <Clock size={160} strokeWidth={0.5} />
            </div>
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
                <Zap size={14} className="text-emerald-400 fill-emerald-400" /> Node Status: Active
              </h2>
              <p className="font-display text-[42px] font-black leading-[1.05] tracking-tight mb-8">
                {period === "day" ? "Daily" : period === "week" ? "Weekly" : "Monthly"} Knowledge Retention Matrix
              </p>
              <p className="text-[18px] text-slate-400 font-bold leading-relaxed print:text-slate-600">
                A high-fidelity stream of {articles.length} intelligence items categorized for professional exam orientation.
                Sourced directly from AffairsCloud.
              </p>
            </div>
          </section>

          {/* Categorically Mapped Content */}
          <div className="space-y-12">
            {Object.entries(grouped).map(([category, items], sIdx) => (
              <div
                key={category}
                className="rounded-[48px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/20 transition-all hover:border-slate-300 print:border-none print:shadow-none print:mb-20 print:break-before-page"
              >
                <button
                  onClick={() => toggle(category)}
                  className="w-full flex items-center justify-between px-12 py-10 hover:bg-slate-50/50 transition-all print:px-0 print:py-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-4 h-4 rounded-full bg-slate-900 shadow-2xl shadow-slate-200" />
                    <span className="font-display text-[26px] md:text-[32px] font-black text-slate-900 uppercase tracking-tighter">
                      <span className="text-slate-300 mr-4 font-black">{String.fromCharCode(65 + sIdx)}</span> {category}
                    </span>
                    <span className="text-[11px] font-black text-indigo-600 px-5 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 uppercase tracking-widest ml-4">
                      {items.length} Intelligence Items
                    </span>
                  </div>
                  <ChevronDown size={28} className={`text-slate-300 transition-transform duration-500 print:hidden ${open.includes(category) ? "rotate-180" : ""}`} />
                </button>

                {(open.includes(category) || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
                  <div className="px-16 pb-16 pt-6 animate-fade-in print:px-0 print:-mt-4">
                    <div className="space-y-12">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex gap-10 group print:break-inside-avoid">
                          <span className="text-[18px] font-black text-slate-200 mt-1 font-mono transition-colors group-hover:text-slate-900">
                            {(idx + 1).toString().padStart(2, "0")}
                          </span>
                          <div className="border-l-8 border-slate-50 pl-12 group-hover:border-slate-900 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest ${item.source === 'AffairsCloud'
                                  ? 'bg-indigo-50 text-indigo-600'
                                  : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                {item.source}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400 capitalize">
                                {new Date(item.pubDate).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-display text-[22px] font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-[16px] leading-relaxed text-slate-500 font-bold group-hover:text-slate-900 transition-colors">
                              {item.summary.replace(/<[^>]*>?/gm, '')}
                            </p>
                            <div className="mt-8">
                              <a
                                href={item.link}
                                target="_blank"
                                className="flex items-center gap-2 text-[12px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-all group/btn print:hidden"
                              >
                                Read Primary Document <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-60 text-center bg-slate-50 border-4 border-dashed border-slate-100 rounded-[64px] mt-20">
          <Zap size={64} className="mx-auto text-slate-200 mb-6" />
          <p className="text-slate-400 font-black uppercase text-[12px] tracking-[0.5em]">No validated intelligence nodes currently in range</p>
        </div>
      )}

      {/* Corporate Certification Footer for Print */}
      <footer className="hidden print:block border-t-[10px] border-slate-900 pt-20 mt-40 text-center">
        <p className="text-[18px] font-black text-slate-900 uppercase tracking-[0.5em] mb-4">CONFIDENTIAL STRATEGIC UNIT • BANKPREP TERMINAL</p>
        <p className="text-[14px] text-slate-400 font-bold max-w-3xl mx-auto leading-relaxed">
          Compiled from direct synchronization with AffairsCloud nodes.
          All intelligence items listed have been vetted for examination relevance and technical accuracy.
        </p>
        <p className="text-[11px] font-black text-slate-300 mt-10 uppercase tracking-widest">
          SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()} • PAGE END
        </p>
      </footer>
    </div>
  );
}
