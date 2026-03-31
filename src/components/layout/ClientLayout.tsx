"use client";
import { usePathname } from "next/navigation";
import ChatWidget from "../features/ChatWidget";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-screen bg-slate-950 overflow-hidden flex flex-col relative w-full">
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-0 scroll-smooth">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}
