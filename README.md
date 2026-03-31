# 🏦 BankPrep — Current Affairs for Bank Exams

A **Next.js 14 + TypeScript + Tailwind CSS** application for bank exam preparation with **real live data** — no mock data.

## ✨ Features

- 📰 **Live Current Affairs** — Real news from Indian sources via NewsAPI
- 🤖 **AI Daily Digest** — Claude AI summarizes today's news for exam relevance
- 🧠 **AI-Generated Quiz** — Questions based on real, today's news articles
- 💬 **AI Tutor Chat** — Ask any current affairs question (powered by Claude)
- 🔖 **Bookmarks** — Save articles for later review
- 📊 **Progress Tracking** — Track your study stats
- 🎯 **Exam-Focused** — IBPS PO, SBI Clerk, RRB, RBI Grade B

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API Keys

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in your API keys:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEWS_API_KEY=your_newsapi_key_here
```

- **Anthropic API Key**: Get from https://console.anthropic.com (paid)
- **NewsAPI Key**: Get from https://newsapi.org (free tier: 100 requests/day)

### 3. Run the app
```bash
npm run dev
```

Open http://localhost:3000

## 📁 Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── current-affairs/route.ts   # AI digest + news endpoint
│   │   ├── news/route.ts              # Live news fetching
│   │   ├── quiz/route.ts              # AI quiz generation
│   │   └── ask/route.ts               # AI tutor chat
│   ├── page.tsx                       # Dashboard
│   ├── news/page.tsx                  # Current Affairs browser
│   ├── digest/page.tsx                # Daily AI Digest
│   ├── quiz/page.tsx                  # Interactive Quiz
│   ├── ask/page.tsx                   # AI Tutor Chat
│   ├── bookmarks/page.tsx             # Saved Articles
│   ├── stats/page.tsx                 # Study Progress
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                # Navigation sidebar
│   │   └── Header.tsx                 # Top header
│   ├── features/
│   │   └── NewsCard.tsx               # News article card
│   └── ui/
│       ├── Skeleton.tsx               # Loading skeletons
│       ├── CategoryFilter.tsx         # Category buttons
│       └── StatsCard.tsx              # Stats widget
├── lib/
│   ├── newsApi.ts                     # NewsAPI integration
│   ├── anthropic.ts                   # Claude AI integration
│   └── utils.ts                       # Utilities & helpers
└── types/
    └── index.ts                       # TypeScript types
```

## 🔌 Real Data Sources

| Feature | Data Source |
|---------|------------|
| News Articles | NewsAPI.org (Indian sources) |
| Daily Digest | Claude AI + live news |
| Quiz Questions | Claude AI + today's articles |
| AI Chat | Claude claude-sonnet-4-20250514 |

## 🎯 Exam Coverage

- **IBPS PO/Clerk** — Economy, Banking, Government
- **SBI PO/Clerk** — All categories + Appointments  
- **RRB PO/Clerk** — Banking, Current affairs
- **RBI Grade B** — Economy, Finance, International

## ⚡ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude (claude-sonnet-4-20250514)
- **News**: NewsAPI.org
- **Icons**: Lucide React
- **Fonts**: Playfair Display + DM Sans
