interface Props {
  title: string;
  value: number | string;
  color: "blue" | "crimson" | "gold" | "emerald";
  subtitle?: string;
}

const colorMap = {
  blue: {
    accent: "#4f46e5",
    muted: "#eef2ff",
    text: "#4338ca"
  },
  crimson: {
    accent: "#dc2626",
    muted: "#fef2f2",
    text: "#b91c1c"
  },
  gold: {
    accent: "#ca8a04",
    muted: "#fefce8",
    text: "#854d0e"
  },
  emerald: {
    accent: "#16a34a",
    muted: "#f0fdf4",
    text: "#15803d"
  },
};

export default function StatsCard({ title, value, color, subtitle }: Props) {
  const c = colorMap[color];
  return (
    <div className="group bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">{title}</p>
          {subtitle && (
            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">{subtitle}</p>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12"
          style={{ background: c.muted }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
        </div>
      </div>
      
      <div className="flex items-end gap-3">
        <p className="font-display text-[42px] font-extrabold text-slate-900 leading-none tracking-tight">
          {value}
        </p>
        <div className="mb-1.5 h-1 w-10 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full w-[60%] rounded-full animate-pulse" style={{ background: c.accent }} />
        </div>
      </div>
    </div>
  );
}
