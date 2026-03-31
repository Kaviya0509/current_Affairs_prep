import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { analyzeUserQuery } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    const analysis = await analyzeUserQuery(query);
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Ask AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
