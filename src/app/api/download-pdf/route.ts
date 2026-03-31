import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { fetchCurrentAffairs, filterByWeek, filterByMonth } from '@/lib/fetchCurrentAffairs';
import { CurrentAffairsPDF } from '@/lib/CurrentAffairsPDF';
import React from 'react';

export async function GET(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get('type') as 'Weekly' | 'Monthly') || 'Weekly';

  const all = await fetchCurrentAffairs();
  const articles = type === 'Weekly' ? filterByWeek(all) : filterByMonth(all);

  const now = new Date();
  const dateRange = type === 'Weekly'
    ? `${new Date(now.getTime() - 7 * 86400000).toLocaleDateString('en-IN')} – ${now.toLocaleDateString('en-IN')}`
    : `${new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-IN')} – ${now.toLocaleDateString('en-IN')}`;

  // @ts-ignore
  const buffer = await renderToBuffer(
    React.createElement(CurrentAffairsPDF, { articles, type, dateRange }) as any
  );

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="current-affairs-${type.toLowerCase()}-${now.toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
