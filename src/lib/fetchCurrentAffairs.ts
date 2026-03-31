import Parser from 'rss-parser';

const parser = new Parser({
  customFields: { 
    item: ['category', 'content:encoded'] 
  }
});

export type Article = {
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  content: string;
  category: string;
  source: 'AffairsCloud';
};

export async function fetchCurrentAffairs(): Promise<Article[]> {
  const feeds = [
    { url: 'https://affairscloud.com/feed/', source: 'AffairsCloud' as const },
  ];

  const results = await Promise.allSettled(
    feeds.map(async ({ url, source }) => {
      const feed = await parser.parseURL(url);
      return feed.items.map((item: any) => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        summary: item.contentSnippet || '',
        content: item['content:encoded'] || item.contentSnippet || '',
        category: Array.isArray(item.categories)
          ? item.categories[0] || 'General'
          : item.category || 'General',
        source,
      }));
    })
  );

  const articles: Article[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') articles.push(...result.value);
  }

  // Sort by date, newest first
  return articles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}

export function filterByWeek(articles: Article[]): Article[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return articles.filter((a) => new Date(a.pubDate) >= weekAgo);
}

export function filterByMonth(articles: Article[]): Article[] {
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  return articles.filter((a) => new Date(a.pubDate) >= monthAgo);
}
