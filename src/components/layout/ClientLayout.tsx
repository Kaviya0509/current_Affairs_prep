"use client";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Removed Sidebar and Header per user request to maximize screen space for BankPrep Intelligence */}
      <main className="min-h-screen overflow-y-auto overflow-x-hidden p-0 scroll-smooth">
        {children}
      </main>
    </div>
  );
}
