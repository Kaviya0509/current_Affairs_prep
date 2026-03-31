"use client";
import React, { useState } from "react";
import { MessageCircle, X, Sparkles, Brain, Send } from "lucide-react";

function SimpleMarkdown({ content }: { content: string }) {
  // Safe, zero-dependency markdown parsing for the chat interface
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/gm, '<ul style="margin: 10px 0; padding-left: 20px;">$1</ul>')
    .split('\n').map(line => line.trim() ? `<p style="margin-bottom: 8px;">${line}</p>` : '').join('');

  return <div className="chat-markdown" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChat = async (overrideMsg?: string) => {
    const messageToSend = overrideMsg || input;
    if (!messageToSend.trim() || loading) return;
    const userMsg = messageToSend.trim();
    setInput("");
    setHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: history.slice(-4) })
      });
      if (!res.ok) throw new Error("Connection failed.");
      const data = await res.json();
      setHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      setHistory(prev => [...prev, { role: "assistant", content: "📡 Connection unstable. Unable to reach intelligence node." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl z-[210] transition-all duration-500 group
          ${isOpen ? 'bg-slate-900 rotate-90 scale-90' : 'bg-sky-600 hover:bg-sky-500 scale-100 hover:rotate-12 shadow-sky-600/40'}
        `}
      >
        {isOpen ? (
          <X size={28} className="text-white" />
        ) : (
          <div className="relative">
            <MessageCircle size={28} className="text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 rounded-full border-4 border-sky-600 flex items-center justify-center animate-bounce">
              <Sparkles size={10} className="text-sky-900" />
            </div>
          </div>
        )}
      </button>

      {/* CHAT INTERFACE - Responsive Positioning */}
      {isOpen && (
        <div className={`fixed z-[200] bg-slate-950 sm:bg-slate-900 border-none sm:border sm:border-white/5 shadow-2xl flex flex-col overflow-hidden animate-fade-up backdrop-blur-3xl ring-1 ring-white/5 transition-all
          inset-0 w-full h-full sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[420px] sm:h-[650px] sm:rounded-[32px]
        `}>
          {/* PREMIUM HEADER */}
          <div className="p-6 md:p-8 pb-4 border-b border-white/5 bg-gradient-to-br from-sky-600/20 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-2xl shadow-sky-600/30">
                  <Sparkles size={24} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-black text-[15px] uppercase tracking-[2px]">Neural Intelligence</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <p className="text-sky-400/60 text-[10px] font-black uppercase tracking-widest">Node Active</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* TOPIC CONTEXT CHIPS */}
          <div className="px-6 py-5 bg-slate-900/40 border-b border-white/5 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {[
                { label: "Briefing", cmd: "Summarize today's news briefly.", color: "sky" },
                { label: "Banking", cmd: "Quiz me on Banking & Finance.", color: "blue" },
                { label: "SSC/UPSC", cmd: "History & Polity intelligence.", color: "emerald" },
              ].map(t => (
                <button
                  key={t.label}
                  onClick={() => handleChat(t.cmd)}
                  className={`px-4 py-2 rounded-xl bg-${t.color}-500/10 border border-${t.color}-500/20 text-${t.color}-400 text-[10px] font-black uppercase tracking-wider hover:bg-${t.color}-600 hover:text-white transition-all`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* CHAT STREAM AREA */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
            {history.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 bg-slate-800/40 border border-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-white/5">
                  <Brain className="text-sky-500" size={40} />
                </div>
                <h5 className="text-white font-black text-[22px] mb-4 tracking-tighter">Command Readiness</h5>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed max-w-[260px] mx-auto">
                  Direct access to the AffairsCloud intelligence repository.
                </p>
              </div>
            ) : (
              history.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
                  <div className={`max-w-[92%] p-5 rounded-[24px] text-[14.5px] leading-relaxed shadow-2xl ${m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none shadow-sky-600/20 ml-4'
                    : 'bg-slate-800 border border-white/5 text-slate-200 rounded-bl-none mr-4'
                    }`}>
                    <SimpleMarkdown content={m.content} />
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-slate-800/30 p-6 rounded-[32px] border border-white/5 flex gap-3">
                  <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* CRITICAL INPUT TERMINAL */}
          <div className="p-5 sm:p-8 border-t border-white/5 bg-slate-950/40 sticky bottom-0">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                placeholder="Initialize Query..."
                className="w-full bg-slate-900 border-2 border-white/10 focus:border-sky-500/40 rounded-2xl py-4 sm:py-5 px-6 sm:px-7 pr-16 sm:pr-20 text-[13px] sm:text-[14.5px] text-white outline-none transition-all placeholder:text-slate-600 font-bold shadow-inner"
              />
              <button
                onClick={() => handleChat()}
                className="absolute right-2 sm:right-3.5 w-10 h-10 sm:w-12 sm:h-12 bg-sky-600 hover:bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-xl transition-all scale-90 group-focus-within:scale-100 active:scale-95"
              >
                <Send size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-center text-[8px] sm:text-[9px] font-bold text-slate-600 uppercase tracking-[2px] sm:tracking-[3px] mt-4">AI Guidance may vary. Cross-reference briefings.</p>
          </div>
        </div>
      )}
    </>
  );
}
