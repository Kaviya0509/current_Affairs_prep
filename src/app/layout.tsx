// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "BankPrep — Current Affairs for Bank Exams",
  description:
    "Live current affairs, AI-powered daily digest, and practice quizzes for IBPS, SBI, RRB & RBI bank exam preparation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white min-h-screen antialiased text-slate-900">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
