import Link from "next/link";
import { User, Shield,Zap, Bell, Search, Menu, LogIn, Sparkles } from "lucide-react";

interface Props {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: Props) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-20 bg-white/60 backdrop-blur-3xl border-b border-black/5 px-6 md:px-10 flex items-center sticky top-0 z-50">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-3 mr-4 rounded-xl bg-slate-100 text-black hover:bg-black hover:text-white transition-all active:scale-95 group"
      >
        <Menu size={20} className="transition-transform group-hover:rotate-180 duration-500" />
      </button>

      {/* Institutional Branding */}
      <div className="flex-1 min-w-0 flex items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display font-black text-[18px] text-black tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Intelligence Port
            </h2>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest leading-none">Status: Linked</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-0.5">
            Command Center • {today}
          </p>
        </div>

        {/* Global Search Bar (Professional Minimalist) */}
        <div className="hidden xl:flex items-center max-w-sm w-full bg-slate-100 rounded-2xl h-11 px-4 ml-8 group focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all overflow-hidden">
          <Search size={16} className="text-slate-400 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            placeholder="Search Intelligence Dossiers..."
            className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-black placeholder:text-slate-400 px-3"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded bg-white px-1.5 font-mono text-[9px] font-black text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Global Command Center Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        <button className="hidden sm:flex items-center justify-center p-2.5 text-black hover:bg-slate-100 rounded-xl transition-all relative group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white" />
        </button>

        <div className="hidden md:flex items-center gap-4 border-r border-slate-200 pr-5 mr-1">
           <div className="text-right">
              <p className="text-[13px] font-black text-black leading-none mb-1">Venkatesh M.</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center justify-end gap-1">
                <Shield size={10} className="text-sky-600" /> Authorized OFFICIAL
              </p>
           </div>
        </div>
        
        <Link 
          href="/login"
          className="flex items-center gap-3 pl-1 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white font-black text-[15px] cursor-pointer overflow-hidden relative group-hover:bg-sky-600 active:scale-95 transition-all">
            <User size={20} className="group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      </div>
    </header>
  );
}
