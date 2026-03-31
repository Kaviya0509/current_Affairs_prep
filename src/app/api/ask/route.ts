import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { analyzeUserQuery } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query } = body;
    
    if (!query) {
      return NextResponse.json({ error: "Query protocol is required for analysis." }, { status: 400 });
    }
    
    const analysis = await analyzeUserQuery(query);
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Ask AI API Critical Error:", error);
    return NextResponse.json({ error: "Node synchronization failed. Please retry." }, { status: 500 });
  }
}
