"use client";
import { useEffect, useState } from "react";
import { NewsArticle, CurrentAffairsDigest } from "@/types";
import NewsCard from "@/components/features/NewsCard";
import { NewsCardSkeleton } from "@/components/ui/Skeleton";
import {
  BookOpen,
  Brain,
  Flame,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [digest, setDigest] = useState<CurrentAffairsDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/current-affairs");
        if (!res.ok) throw new Error((await res.json()).error);
        const data = await res.json();
        setArticles(data.articles || []);
        setDigest(data.digest || null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const highRelevance = articles.filter((a) => a.examRelevance === "high").slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-up px-4 md:px-8 py-6">
      <style dangerouslySetInnerHTML={{
        __html: `
        .dash-container { font-family: 'DM Sans', sans-serif; }
        .hero-banner { 
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 28px; padding: clamp(24px, 4vw, 40px); 
          position: relative; overflow: hidden;
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
        }
        .hero-banner::after { content: ''; position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.05; }
        
        .mega-test-banner {
          background: linear-gradient(135deg, #4ade80, #38bdf8, #a855f7, #f472b6);
          background-size: 300% 300%;
          animation: gradient-shift 10s ease infinite;
          border-radius: 24px; padding: 24px; display: flex; align-items: center; justify-content: space-between;
          color: #fff; border: none; box-shadow: 0 15px 35px rgba(56,189,248,0.2);
          position: relative; overflow: hidden; gap: 20px;
        }
        @media (max-width: 640px) {
          .mega-test-banner { flex-direction: column; align-items: flex-start; text-align: left; }
          .mega-test-banner a { width: 100%; text-align: center; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .stat-card-v2 { 
          background: #fff; border-radius: 18px; padding: 20px; 
          border: 1px solid rgba(0,0,0,0.05); transition: all 0.4s;
          box-shadow: 0 10px 25px rgba(0,0,0,0.02);
        }
        .stat-card-v2:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.04); border-color: #38bdf8; }
      `}} />

      {/* Modern High-Impact Banner (Compact) */}
      <div className="hero-banner text-white">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            <Zap size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Operational Pulse</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Command <span className="text-sky-400">Hub.</span>
          </h1>
          <p className="text-slate-400 text-[14px] leading-relaxed mb-6 font-medium">
            Daily-curated dossiers and high-fidelity practice sets for professional banking examinations.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/news" className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all">
              Hub
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-sky-500/20 rounded-full blur-[100px]" />
      </div>

      {/* Mega Test Strategic Card */}
      <div className="mega-test-banner">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={18} className="text-white" />
            <span className="text-[9px] font-black uppercase tracking-[3px] text-white/80">Mega Assessment Module</span>
          </div>
          <h2 className="text-[18px] sm:text-lg md:text-xl font-black text-white tracking-tighter leading-tight break-words">Initialize Terminal Test</h2>
        </div>
        <Link href="/news?startTest=true" className="relative z-10 px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all hover:scale-105 active:scale-95 shadow-lg">
          Start Mega Test
        </Link>
      </div>

      {/* Advanced Stats Architecture (Compact) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Intelligence", val: articles.length, icon: <BookOpen size={16} className="text-sky-500" />, sub: "Daily dossiers", color: "bg-sky-500" },
          { label: "Critical", val: highRelevance.length, icon: <AlertCircle size={16} className="text-rose-500" />, sub: "Action required", color: "bg-rose-500" },
          { label: "AI Node", val: "Active", icon: <Brain size={16} className="text-indigo-500" />, sub: "Powered by Groq", color: "bg-indigo-500" },
          { label: "Streak", val: "5 Days", icon: <Flame size={16} className="text-orange-500" />, sub: "Level 2", color: "bg-orange-500" },
        ].map((s, i) => (
          <div key={i} className="stat-card-v2">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                {s.icon}
              </div>
              <div className={`${s.color}/10 px-2 py-0.5 rounded-md`}>
                <span className={`text-[8px] font-black uppercase tracking-widest ${s.color.replace('bg-', 'text-')}`}>Stat</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mb-0.5">{s.val}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</div>
            <div className="text-[10px] text-slate-500 font-medium leading-none">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">Briefings</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mt-1">High Relevance Stream</p>
            </div>
            <Link href="/news" className="flex items-center gap-1.5 text-[10px] font-black text-sky-500 uppercase tracking-widest hover:gap-2 transition-all">
              Portal <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <NewsCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highRelevance.map((article) => (
                <NewsCard key={article.id} article={article} compact />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[28px] p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="px-2 py-0.5 bg-white/10 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest">Rollup</div>
                <TrendingUp size={16} className="text-sky-400" />
              </div>
              <h3 className="text-lg font-black mb-3">Executive Digest</h3>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-white/5 rounded-full animate-pulse w-full" />
                  <div className="h-3 bg-white/5 rounded-full animate-pulse w-[80%]" />
                </div>
              ) : digest ? (
                <div className="space-y-4">
                  <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-3">{digest.summary}</p>
                  <Link href="/digest" className="block w-full py-2.5 bg-white text-slate-900 rounded-xl text-center text-[9px] font-black uppercase tracking-[2px] hover:bg-sky-400 hover:text-white transition-all">
                    Full Digest
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
            <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[2px] mb-4">Tactical Links</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Economy Hub", href: "/quiz?category=economy", sub: "12 sets" },
                { label: "Banking Alpha", href: "/quiz?category=banking", sub: "Fresh" },
                { label: "Intelligence Ask", href: "/ask", sub: "Direct Chat" },
              ].map((link, i) => (
                <Link key={i} href={link.href} className="group p-3 bg-slate-50 hover:bg-sky-50 rounded-xl border border-slate-100 hover:border-sky-100 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-slate-900 group-hover:text-sky-600 transition-colors">{link.label}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{link.sub}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
