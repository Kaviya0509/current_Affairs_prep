"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Newspaper, 
  Bookmark, 
  FileSearch, 
  BarChart3, 
  Zap, 
  MessageSquare, 
  Settings,
  ShieldCheck,
  ChevronRight,
  FileDown
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Executive Briefing", path: "/", icon: LayoutDashboard },
  { name: "Intelligence Feed", path: "/news", icon: Newspaper },
  { name: "Download Repository", path: "/downloads", icon: FileDown },
  { name: "Strategic Analysis", path: "/digest", icon: FileSearch },
  { name: "Knowledge Library", path: "/bookmarks", icon: Bookmark },
  { name: "Practice Units", path: "/quiz", icon: Zap },
  { name: "Performance Metrics", path: "/stats", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white h-full border-r border-slate-100 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-10 pb-8">
        <Link href="/" className="group inline-flex items-center gap-4">
          <div className="w-11 h-11 bg-slate-900 rounded-[18px] flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg] shadow-xl shadow-slate-200">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <span className="block font-display font-black text-[22px] tracking-tight text-slate-900 leading-none">
              BankPrep
            </span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Intelligence</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-5 space-y-1 overflow-y-auto pt-6">
        <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">
          Intelligence Console
        </p>
        <div className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  group flex items-center px-4 py-3 rounded-[14px] transition-all duration-300
                  ${isActive 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive ? "bg-white/10" : "bg-slate-50 group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-slate-100"}
                  `}>
                    <Icon size={18} className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"}`} />
                  </div>
                  <span className={`text-[14px] font-bold tracking-tight ${isActive ? "translate-x-0" : "group-hover:translate-x-1"} transition-all`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-5 h-5 rounded-lg flex items-center justify-center animate-pulse">
                      <ChevronRight size={14} className="text-white/40" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-10">
          <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">
             User Settings
          </p>
          <Link
            href="/settings"
            className="group flex items-center px-4 py-3 rounded-[14px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
             <div className="flex items-center gap-4">
               <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                  <Settings size={18} />
               </div>
               <span className="text-[14px] font-bold tracking-tight">System Settings</span>
             </div>
          </Link>
        </div>
      </nav>

      <div className="p-6 border-t border-slate-100 mt-auto">
        <div className="p-4 bg-slate-50/80 rounded-[24px] border border-slate-100 shadow-sm group">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Center</p>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[13px] font-bold text-slate-900 mb-0.5 group-hover:text-indigo-600 transition-colors">Expert Protocol Active</p>
          <p className="text-[10px] font-medium text-slate-400">Layer 4 Encryption Status</p>
        </div>
      </div>
    </aside>
  );
}
