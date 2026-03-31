import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font
} from '@react-pdf/renderer';
import { Article } from './fetchCurrentAffairs';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#fff' },
  header: { marginBottom: 20, borderBottom: '2pt solid #5B4FCF', paddingBottom: 10 },
  headerTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold' as any, color: '#5B4FCF' },
  headerSub: { fontSize: 10, color: '#666', marginTop: 4 },
  categoryHeader: {
    fontSize: 13, fontFamily: 'Helvetica-Bold' as any,
    backgroundColor: '#EEF2FF', color: '#3730A3',
    padding: '6 10', marginTop: 16, marginBottom: 8,
    borderRadius: 4,
  },
  articleCard: {
    marginBottom: 10, padding: 10,
    border: '0.5pt solid #E5E7EB', borderRadius: 4,
  },
  articleTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold' as any, color: '#111', marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  badge: {
    fontSize: 8, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, fontFamily: 'Helvetica-Bold' as any,
  },
  affairsBadge: { backgroundColor: '#EDE9FE', color: '#6D28D9' },
  careersBadge: { backgroundColor: '#CCFBF1', color: '#0F766E' },
  dateBadge: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  summary: { fontSize: 9, color: '#444', lineHeight: 1.5 },
  footer: {
    position: 'absolute', bottom: 20, left: 40, right: 40,
    borderTop: '0.5pt solid #E5E7EB', paddingTop: 6,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: '#9CA3AF' },
});

function groupByCategory(articles: Article[]) {
  return articles.reduce((acc, article) => {
    const cat = article.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(article);
    return acc;
  }, {} as Record<string, Article[]>);
}

type Props = {
  articles: Article[];
  type: 'Weekly' | 'Monthly';
  dateRange: string;
};

export function CurrentAffairsPDF({ articles, type, dateRange }: Props) {
  const grouped = groupByCategory(articles);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {type} Current Affairs
          </Text>
          <Text style={styles.headerSub}>{dateRange} · AffairsCloud · {articles.length} articles</Text>
        </View>

        {/* Articles grouped by category */}
        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} wrap={false}>
            <Text style={styles.categoryHeader}>{category}</Text>
            {items.map((article, i) => (
              <View key={i} style={styles.articleCard} wrap={false}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={[
                    styles.badge,
                    article.source === 'AffairsCloud'
                      ? styles.affairsBadge
                      : styles.affairsBadge
                  ]}>
                    {article.source}
                  </Text>
                  <Text style={[styles.badge, styles.dateBadge]}>
                    {new Date(article.pubDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </Text>
                </View>
                {article.summary ? (
                  <Text style={styles.summary}>
                    {article.summary.slice(0, 300)}
                    {article.summary.length > 300 ? '...' : ''}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated from AffairsCloud RSS</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}
