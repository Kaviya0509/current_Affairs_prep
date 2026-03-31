"use client";
import StatsCard from "@/components/ui/StatsCard";

const EXAMS = [
  { name: "IBPS PO 2026", date: "October 2026" },
  { name: "SBI Clerk 2026", date: "November 2026" },
  { name: "RRB PO 2026", date: "August 2026" },
  { name: "RBI Grade B 2026", date: "July 2026" },
];

const TIPS = [
  { name: "Banking & Finance", text: "Focus on RBI policies, repo rate, CRR, SLR, Basel norms, SARFAESI Act, NPA classification." },
  { name: "Economy", text: "Study GDP data, inflation (CPI/WPI), budget highlights, Economic Survey, forex reserves." },
  { name: "Government", text: "Track schemes with fund sizes, ministry announcements, cabinet decisions, bills passed." },
  { name: "International", text: "Follow G20, G7, UN resolutions, bilateral agreements, India's global rankings." },
];

const ACHIEVEMENTS = [
  { label: "First Quiz", unlocked: true, sub: "Unlocked" },
  { label: "5 Quizzes", unlocked: true, sub: "Unlocked" },
  { label: "First Bookmark", unlocked: true, sub: "Unlocked" },
  { label: "High Scorer", unlocked: false, sub: "Score 80%+" },
  { label: "Daily Reader", unlocked: false, sub: "7-day streak" },
  { label: "Top Performer", unlocked: false, sub: "100% score" },
];

export default function StatsPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 animate-fade-up space-y-12">
      {/* Header */}
      <header className="border-b border-slate-100 pb-8 px-2">
        <h1 className="font-display text-[32px] font-bold text-slate-900 tracking-tight leading-none mb-3">
          Performance Metrics
        </h1>
        <p className="text-[15px] text-slate-500 font-medium">Quantifying your preparation journey across the banking ecosystem</p>
      </header>

      {/* Primary Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Quizzes Taken" value={12} subtitle="Practice sessions" color="blue" />
        <StatsCard title="Avg Accuracy" value="74%" subtitle="Across all units" color="emerald" />
        <StatsCard title="Knowledge Nodes" value={3} subtitle="Articles saved" color="gold" />
        <StatsCard title="Retention Streak" value={7} subtitle="Daily active" color="crimson" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Intelligence Targets */}
        <div className="lg:col-span-7 space-y-12">
          <section>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Target Intelligence Windows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXAMS.map((e) => (
                <div key={e.name} className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                  <div>
                    <p className="text-[14.5px] font-bold text-slate-900 mb-1">{e.name}</p>
                    <p className="text-[12px] font-medium text-slate-400">{e.date}</p>
                  </div>
                  <span className="text-[10px] px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase tracking-wider">upcoming</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Tactical Guidance Units</h2>
            <div className="grid grid-cols-1 gap-4">
              {TIPS.map((t) => (
                <div key={t.name} className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100">
                  <p className="text-[13px] font-bold text-slate-900 mb-2 uppercase tracking-wide">{t.name}</p>
                  <p className="text-[14px] leading-relaxed text-slate-600 font-medium">{t.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Skill Milestones */}
        <div className="lg:col-span-5 space-y-12">
          <section className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Operational Milestones</h3>
            <div className="grid grid-cols-2 gap-6">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.label} className={`text-center space-y-2 p-4 rounded-2xl border transition-all ${a.unlocked ? "border-white/10 bg-white/5" : "border-transparent opacity-30 grayscale"}`}>
                  <p className="text-[13px] font-bold text-white">{a.label}</p>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{a.sub}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="p-8 rounded-[32px] bg-blue-50/50 border border-blue-100/50">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">Strategic Status</p>
            <p className="text-[13.5px] leading-relaxed text-blue-800 font-medium">
              Preparation index is currently at 72.4. Focus on 'Economy & Markets' to optimize your success probability for RRB PO.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
