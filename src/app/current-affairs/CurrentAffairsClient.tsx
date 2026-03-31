'use client';

import { useState } from 'react';
import { Article } from '@/lib/fetchCurrentAffairs';
import { OfficialPDF } from '@/lib/fetchOfficialPDFs';
import {
  Download,
  ExternalLink,
  Globe,
  Sparkles,
  BookOpen,
  Zap,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Plane,
  Cpu,
  Users,
  Building2,
  BarChart3,
  FileText,
  ChevronRight,
  Search,
  Calendar,
} from 'lucide-react';

type Props = { articles: Article[]; officialPDFs: OfficialPDF[] };
type Tab = 'articles' | 'generate' | 'official';

// Map categories to icons & colors
const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  Banking: { icon: Building2, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', label: 'Banking & Finance' },
  Economy: { icon: BarChart3, color: '#047857', bg: '#ecfdf5', border: '#6ee7b7', label: 'Economy' },
  National: { icon: ShieldCheck, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', label: 'National Affairs' },
  International: { icon: Plane, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', label: 'International' },
  Sports: { icon: Trophy, color: '#b45309', bg: '#fffbeb', border: '#fcd34d', label: 'Sports' },
  Awards: { icon: Trophy, color: '#9d174d', bg: '#fdf2f8', border: '#f9a8d4', label: 'Awards & Honours' },
  Appointments: { icon: Users, color: '#6d28d9', bg: '#faf5ff', border: '#ddd6fe', label: 'Appointments' },
  'Science & Technology': { icon: Cpu, color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4', label: 'Science & Tech' },
  Technology: { icon: Cpu, color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4', label: 'Technology' },
  Political: { icon: TrendingUp, color: '#be123c', bg: '#fff1f2', border: '#fecdd3', label: 'Political' },
  General: { icon: FileText, color: '#374151', bg: '#f9fafb', border: '#e5e7eb', label: 'General' },
};

function getCategoryMeta(cat: string) {
  for (const key of Object.keys(CATEGORY_META)) {
    if (cat.toLowerCase().includes(key.toLowerCase())) return { ...CATEGORY_META[key], key };
  }
  return { icon: FileText, color: '#374151', bg: '#f9fafb', border: '#e5e7eb', label: cat, key: cat };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPoints(html: string): string[] {
  if (!html) return [];
  const liMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
  if (liMatches.length > 0) {
    return liMatches.map(li => stripHtml(li).trim()).filter(s => s.length > 10).slice(0, 20);
  }
  const plain = stripHtml(html);
  return plain.split(/[.!?]\s+/).filter(s => s.length > 25).slice(0, 12);
}

// ── ArticleRow with inline content drawer ──
type Meta = { icon: any; color: string; bg: string; border: string; label: string };

function ArticleRow({ article, index, meta }: { article: Article; index: number; meta: Meta }) {
  const [open, setOpen] = useState(false);
  const Icon = meta.icon;

  const rawContent = article.content || article.summary || '';
  const isHtml = rawContent.includes('<');
  const points = isHtml ? extractPoints(rawContent) : [];
  const plain = isHtml ? stripHtml(rawContent) : rawContent;
  const summary = plain.slice(0, 300);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full relative overflow-hidden group flex items-start gap-6 bg-white border border-slate-200/70 rounded-[24px] p-6 hover:border-slate-800 hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition-all duration-500 text-left cursor-pointer z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        
        {/* Number Badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-black mt-1 border transition-all duration-300 group-hover:scale-105"
          style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
        >
          {index.toString().padStart(2, '0')}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-display text-[17px] font-bold text-slate-800 leading-snug group-hover:text-slate-900 transition-colors mb-2.5 line-clamp-2">
            {article.title}
          </p>
          {summary && (
            <p className="text-[13.5px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4 group-hover:text-slate-600 transition-colors">
              {summary}
            </p>
          )}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-[0.1em] border" style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>
              {article.source}
            </span>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
              <Calendar size={12} className="opacity-70" />
              {new Date(article.pubDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 transition-all duration-500 mt-1">
           <ChevronRight size={16} className="text-slate-400 group-hover:text-white transition-colors" />
        </div>
      </button>

      {/* ── Content Drawer ── */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl h-screen bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

            {/* Drawer Header */}
            <div className="p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-2xl z-20 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: meta.color }}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-[10px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-[0.1em] border" style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>{meta.label}</span>
                    <span className="text-[10px] font-black px-3.5 py-1.5 rounded-lg bg-slate-900 text-white uppercase tracking-[0.1em]">{article.source}</span>
                  </div>
                  <h2 className="font-display text-[24px] md:text-[28px] font-bold text-slate-900 leading-tight mb-3">
                    {article.title}
                  </h2>
                  <p className="text-[12px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                    <Calendar size={14} className="text-slate-300" />
                    {new Date(article.pubDate).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={() => setOpen(false)} 
                  className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-900 group flex items-center justify-center transition-all flex-shrink-0 border border-slate-100"
                >
                  <span className="text-[24px] font-light text-slate-400 group-hover:text-white transition-colors leading-none pb-1">×</span>
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
              {points.length > 0 ? (
                <div className="max-w-3xl mx-auto">
                  <div className="p-5 rounded-2xl mb-8 flex items-center gap-4 bg-white border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: meta.bg }}>
                       <Sparkles size={18} style={{ color: meta.color }} />
                    </div>
                    <p className="text-[12px] font-black text-slate-800 uppercase tracking-widest">
                      Key Highlights · {points.length} Critical Nodes
                    </p>
                  </div>
                  <ul className="space-y-6 mb-12">
                    {points.map((pt, i) => (
                      <li key={i} className="flex gap-5 items-start bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <span className="w-8 h-8 rounded-full text-[12px] font-black flex items-center justify-center flex-shrink-0 border" style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>
                          {i + 1}
                        </span>
                        <p className="text-[15px] font-medium text-slate-700 leading-relaxed pt-1.5">{pt}</p>
                      </li>
                    ))}
                  </ul>
                  {plain.length > 50 && (
                    <div className="pt-10 border-t-2 border-dashed border-slate-200">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Extended Intelligence Content</p>
                      <p className="text-[14.5px] text-slate-600 leading-[1.8] font-medium p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                         {plain.slice(0, 1500)}...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                   <p className="text-[15px] font-medium text-slate-600 leading-[1.8] p-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
                     {plain || 'Full detailed content stream is available on the primary source node.'}
                   </p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 h-13 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest text-white transition-all shadow-lg"
                style={{ background: meta.color }}
              >
                Read Full Article on {article.source} <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default function CurrentAffairsClient({ articles, officialPDFs }: Props) {
  const [tab, setTab] = useState<Tab>('articles');
  const [downloading, setDownloading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  async function handleDownload(type: 'Weekly' | 'Monthly') {
    try {
      setDownloading(true);
      const res = await fetch(`/api/download-pdf?type=${type}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `current-affairs-${type.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF Download Error:', error);
    } finally {
      setDownloading(false);
    }
  }

  // Group articles by category
  const grouped = articles.reduce((acc, article) => {
    const cat = article.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  // Build ordered category list by article count (most first)
  const categories = ['All', ...Object.keys(grouped).sort((a, b) => grouped[b].length - grouped[a].length)];

  // Filter articles
  const displayArticles = (activeCategory === 'All' ? articles : (grouped[activeCategory] || []))
    .filter(a => search ? a.title.toLowerCase().includes(search.toLowerCase()) : true);

  // Re-group for display
  const displayGrouped = displayArticles.reduce((acc, article) => {
    const cat = article.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  return (
    <main className="min-h-screen bg-white">
      {/* Top Header */}
      <div className="border-b border-slate-100 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-slate-900 leading-none">Current Affairs</h1>
              <p className="text-[12px] text-slate-400 font-bold mt-0.5">AffairsCloud · {articles.length} articles synced</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {([
              { id: 'articles', label: 'News Feed', icon: Zap },
              { id: 'generate', label: 'Download PDF', icon: Sparkles },
              { id: 'official', label: 'Official PDFs', icon: Globe },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-wide transition-all ${tab === t.id
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-400 hover:text-slate-700'
                  }`}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEWS FEED ── */}
      {tab === 'articles' && (
        <div className="max-w-7xl mx-auto px-6 py-10 flex gap-10">

          {/* Left Sidebar: Category Navigation */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Categories</p>
              {categories.map((cat) => {
                const meta = cat === 'All' ? null : getCategoryMeta(cat);
                const count = cat === 'All' ? articles.length : (grouped[cat]?.length || 0);
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all group ${isActive
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {meta ? (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: isActive ? 'rgba(255,255,255,0.15)' : meta.bg }}
                        >
                          <meta.icon size={14} style={{ color: isActive ? '#fff' : meta.color }} />
                        </div>
                      ) : (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-white/15' : 'bg-slate-100'}`}>
                          <FileText size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                        </div>
                      )}
                      <span className="text-[13px] font-bold truncate">
                        {cat === 'All' ? 'All Categories' : (meta?.label || cat)}
                      </span>
                    </div>
                    <span className={`text-[11px] font-black tabular-nums ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search + mobile category pills */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search current affairs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              {/* Mobile category pills */}
              <div className="flex gap-2 flex-wrap lg:hidden">
                {categories.slice(0, 8).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${activeCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Category-wise Article Groups + Drawer */}
            {Object.entries(displayGrouped).length === 0 ? (
              <div className="py-40 text-center">
                <Search size={48} className="mx-auto text-slate-200 mb-6" />
                <p className="text-slate-400 font-bold">No articles found</p>
              </div>
            ) : (
              <div className="space-y-16">
                {Object.entries(displayGrouped).map(([category, catArticles]) => {
                  const meta = getCategoryMeta(category);
                  const Icon = meta.icon;
                  return (
                    <section key={category}>
                      {/* Category Section Header */}
                      <div
                        className="flex items-center gap-4 mb-8 p-5 rounded-2xl"
                        style={{ background: meta.bg, border: `1.5px solid ${meta.border}` }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.color }}
                        >
                          <Icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-[20px] font-black leading-none" style={{ color: meta.color }}>
                            {meta.label}
                          </h2>
                          <p className="text-[11px] font-bold mt-1" style={{ color: meta.color, opacity: 0.6 }}>
                            {catArticles.length} article{catArticles.length !== 1 ? 's' : ''} today
                          </p>
                        </div>
                        <ChevronRight size={18} style={{ color: meta.color, opacity: 0.4 }} />
                      </div>

                      {/* Articles List */}
                      <div className="space-y-3">
                        {catArticles.map((article, i) => (
                          <ArticleRow
                            key={i}
                            index={i + 1}
                            article={article}
                            meta={meta}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GENERATE PDF ── */}
      {tab === 'generate' && (
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-[36px] font-black text-slate-900 mb-3">Download PDF</h2>
            <p className="text-[15px] text-slate-500 font-medium">
              Get professionally formatted current affairs PDFs sourced from AffairsCloud.
            </p>
          </div>

          {(['Weekly', 'Monthly'] as const).map((type) => (
            <div key={type} className="bg-slate-900 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-2">{type === 'Weekly' ? 'Last 7 Days' : 'Last 30 Days'}</p>
                <p className="text-[28px] font-black text-white leading-none">{type} Current Affairs PDF</p>
              </div>
              <button
                onClick={() => handleDownload(type)}
                disabled={downloading}
                className="flex-shrink-0 flex items-center gap-3 bg-white text-slate-900 h-14 px-8 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-xl"
              >
                {downloading ? 'Generating...' : <><Download size={18} /> Download</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── OFFICIAL PDFs ── */}
      {tab === 'official' && (
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
          <h2 className="text-[28px] font-black text-slate-900 mb-8">Official PDF Repository</h2>
          {officialPDFs.length === 0 ? (
            <div className="py-40 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <Globe size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold">Scanning remote archives...</p>
            </div>
          ) : officialPDFs.map((pdf, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="flex-1 pr-6">
                <p className="text-[15px] font-bold text-slate-900 mb-2">{pdf.title}</p>
                <div className="flex gap-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wide ${pdf.source === 'AffairsCloud' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                    {pdf.source}
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-black uppercase tracking-wide">
                    {pdf.type}
                  </span>
                </div>
              </div>
              <a
                href={pdf.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white h-10 px-5 rounded-xl text-[12px] font-black uppercase tracking-wide transition-all shadow-md"
              >
                View <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
