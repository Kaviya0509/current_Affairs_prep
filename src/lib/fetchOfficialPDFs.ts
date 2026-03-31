import axios from 'axios';
import * as cheerio from 'cheerio';

export type OfficialPDF = {
  title: string;
  downloadUrl: string;
  source: 'AffairsCloud';
  type: 'Monthly' | 'Weekly' | 'Other';
};

export async function fetchOfficialPDFLinks(): Promise<OfficialPDF[]> {
  const sources = [
    {
      url: 'https://affairscloud.com/current-affairs-pdf/',
      source: 'AffairsCloud' as const,
    },
  ];

  const results = await Promise.allSettled(
    sources.map(async ({ url, source }) => {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      });
      const $ = cheerio.load(data);
      const pdfs: OfficialPDF[] = [];

      // Find all links ending in .pdf or containing 'pdf'
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (
          (href.includes('.pdf') || href.includes('pdf')) &&
          text.length > 5
        ) {
          const type: OfficialPDF['type'] = text.toLowerCase().includes('month')
            ? 'Monthly'
            : text.toLowerCase().includes('week')
            ? 'Weekly'
            : 'Other';

          pdfs.push({ title: text, downloadUrl: href, source, type });
        }
      });

      return pdfs;
    })
  );

  const allPDFs: OfficialPDF[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') allPDFs.push(...result.value);
  }

  return allPDFs;
}
