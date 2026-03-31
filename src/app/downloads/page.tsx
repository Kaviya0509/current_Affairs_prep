"use client";
import { useState } from "react";
import { 
  FileDown, 
  Calendar, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Download,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function DownloadsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const downloadPDF = async (type: string, filename: string) => {
    try {
      setLoading(type);
      const res = await fetch(`/api/download-pdf?type=${type}`);
      if (!res.ok) throw new Error("Generation failure");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const sections = [
    {
      title: "Daily Intelligence Briefing",
      type: "Weekly", // Smallest unit we currently have for PDF
      filename: `daily_affairs_${new Date().toISOString().split('T')[0]}`,
      description: "Immediate operational updates synchronized with live node sources.",
      icon: <Zap size={24} />,
      color: "indigo"
    },
    {
      title: "Weekly Strategic Dossier",
      type: "Weekly",
      filename: `weekly_affairs_week_${new Date().getWeek()}`,
      description: "Consolidated intelligence feed for structural preparation flows.",
      icon: <Calendar size={24} />,
      color: "emerald"
    },
    {
      title: "Monthly Sectoral Repository",
      type: "Monthly",
      filename: `monthly_affairs_${new Date().toLocaleString('default', { month: 'long' })}`,
      description: "Deep-archive intelligence pack for long-term knowledge retention.",
      icon: <BookOpen size={24} />,
      color: "slate"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-16 px-6 md:px-10 space-y-12 md:space-y-16 animate-fade-up">
      <header className="border-b-2 border-slate-900 pb-8 md:pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-4">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-2xl">
              <FileDown size={24} className="md:w-8 md:h-8" />
           </div>
           <h1 className="text-[32px] md:text-[48px] font-black text-slate-900 tracking-tight leading-none">Download Center</h1>
        </div>
        <p className="text-[14px] md:text-[18px] text-slate-500 font-bold tracking-tight">Official AffairsCloud Compilation Repository</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {sections.map((s, i) => (
          <div key={i} className="group bg-white rounded-[56px] p-10 border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col justify-between overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform duration-700 opacity-5 text-slate-900`}>
               {s.icon}
            </div>
            
            <div className="relative z-10">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white mb-8 md:mb-10 shadow-xl ${s.color === 'indigo' ? 'bg-indigo-600' : s.color === 'emerald' ? 'bg-emerald-600' : 'bg-slate-900'}`}>
                 {s.icon}
              </div>
              <h2 className="text-[22px] md:text-[26px] font-black text-slate-900 leading-tight mb-4">{s.title}</h2>
              <p className="text-[14px] md:text-[15px] text-slate-500 font-bold leading-relaxed mb-8 md:mb-10">
                {s.description}
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                 <span className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Verified Node</span>
                 <span className="px-4 py-2 bg-emerald-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100/50">Official Sync</span>
              </div>
            </div>

            <button
              onClick={() => downloadPDF(s.type, s.filename)}
              disabled={loading === s.type}
              className={`relative z-10 w-full flex items-center justify-center gap-3 h-16 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all ${
                loading === s.type 
                  ? "bg-slate-100 text-slate-400" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl active:scale-95"
              }`}
            >
              {loading === s.type ? (
                <div className="w-5 h-5 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <Download size={20} /> Download Intelligence Node
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <section className="bg-slate-50 rounded-[40px] md:rounded-[56px] p-8 md:p-12 border border-slate-100">
         <div className="flex flex-col lg:flex-row gap-10 md:gap-12 items-center">
            <div className="flex-1 space-y-6 text-center lg:text-left">
               <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4 flex items-center justify-center lg:justify-start gap-2">
                 <Lock size={16} /> Premium Access Tier
               </h3>
               <p className="text-[26px] md:text-[32px] font-black text-slate-900 leading-tight">
                  Unlock Personalized <br className="hidden md:block" /> Study Portfolios.
               </p>
               <p className="text-[14px] md:text-[16px] text-slate-600 font-bold leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Authenticated users can access historical intelligence nodes and create custom PDF dossiers based on bookmarks and practice metrics.
               </p>
               <div className="pt-4">
                  <a href="/signup" className="inline-flex items-center gap-3 px-8 md:px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                     Initialize Account <CheckCircle2 size={18} />
                  </a>
               </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-8 lg:mt-0">
               <div className="p-8 bg-white rounded-[32px] md:rounded-[40px] border border-slate-200 text-center lg:text-left">
                  <p className="text-[28px] md:text-[32px] font-black text-slate-900">48+</p>
                  <p className="text-[11px] md:text-[12px] text-slate-400 font-black uppercase tracking-widest">Active Data Nodes</p>
               </div>
               <div className="p-8 bg-white rounded-[32px] md:rounded-[40px] border border-slate-200 text-center lg:text-left">
                  <p className="text-[28px] md:text-[32px] font-black text-slate-900">92%</p>
                  <p className="text-[11px] md:text-[12px] text-slate-400 font-black uppercase tracking-widest">Accuracy Ratio</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

// Helper for week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};
