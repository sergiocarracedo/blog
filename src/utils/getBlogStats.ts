import { getCollection } from 'astro:content';

type MonthKey = string;

interface PerPeriodStats {
  posts: number;
  words: number;
}

export interface BlogStats {
  generatedAt: string;
  totals: {
    posts: number;
    words: number;
    avgWords: number;
  };
  perYear: Array<{
    year: number;
    posts: number;
    words: number;
    avgWords: number;
  }>;
  perMonth: Array<{
    month: MonthKey;
    posts: number;
    words: number;
    avgWords: number;
  }>;
  perMonthOfYear: Array<{
    month: number;
    label: string;
    posts: number;
    words: number;
    avgWords: number;
  }>;
  gaps: Array<{
    date: string;
    weeksSincePrev: number;
  }>;
  tags: {
    totals: Record<string, number>;
    yearly: Array<{
      year: number;
      tags: Record<string, number>;
    }>;
  };
}

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
};

const toYear = (date: Date) => date.getFullYear();

const toMonthKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const getMonthRange = (from: Date, to: Date) => {
  const months: MonthKey[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const last = new Date(to.getFullYear(), to.getMonth(), 1);

  while (cursor <= last) {
    months.push(toMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

const weeksBetween = (a: Date, b: Date) => {
  const diff = a.getTime() - b.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24 * 7)));
};

const toAvg = (stats: PerPeriodStats) =>
  stats.posts === 0 ? 0 : Math.round((stats.words / stats.posts) * 100) / 100;

export const getBlogStats = async (): Promise<BlogStats> => {
  const posts = await getCollection('blog');

  const entries = posts
    .map((post) => ({
      date: post.data.pubDate,
      words: countWords(post.body ?? ''),
      tags: post.data.tags ?? [],
    }))
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());

  const perYear = new Map<number, PerPeriodStats>();
  const perMonth = new Map<MonthKey, PerPeriodStats>();
  const perMonthOfYear = new Map<number, PerPeriodStats>();
  const tagTotals = new Map<string, number>();
  const tagYearly = new Map<number, Map<string, number>>();
  const gaps: BlogStats['gaps'] = [];

  entries.forEach((entry, index) => {
    const year = toYear(entry.date);
    const monthKey = toMonthKey(entry.date);
    const monthIndex = entry.date.getMonth();

    const yearStats = perYear.get(year) ?? { posts: 0, words: 0 };
    yearStats.posts += 1;
    yearStats.words += entry.words;
    perYear.set(year, yearStats);

    const monthStats = perMonth.get(monthKey) ?? { posts: 0, words: 0 };
    monthStats.posts += 1;
    monthStats.words += entry.words;
    perMonth.set(monthKey, monthStats);

    const monthOfYearStats = perMonthOfYear.get(monthIndex) ?? { posts: 0, words: 0 };
    monthOfYearStats.posts += 1;
    monthOfYearStats.words += entry.words;
    perMonthOfYear.set(monthIndex, monthOfYearStats);

    const yearTagStats = tagYearly.get(year) ?? new Map<string, number>();

    entry.tags.forEach((tag) => {
      const total = (tagTotals.get(tag) ?? 0) + 1;
      tagTotals.set(tag, total);

      yearTagStats.set(tag, (yearTagStats.get(tag) ?? 0) + 1);
    });

    tagYearly.set(year, yearTagStats);

    if (index > 0) {
      const prev = entries[index - 1];
      gaps.push({
        date: entry.date.toISOString().split('T')[0],
        weeksSincePrev: weeksBetween(entry.date, prev.date),
      });
    }
  });

  const perYearArray = Array.from(perYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, stats]) => ({
      year,
      posts: stats.posts,
      words: stats.words,
      avgWords: toAvg(stats),
    }));

  const monthKeys = entries.length
    ? getMonthRange(entries[0].date, entries[entries.length - 1].date)
    : [];

  const perMonthArray = monthKeys.map((month) => {
    const stats = perMonth.get(month) ?? { posts: 0, words: 0 };
    return {
      month,
      posts: stats.posts,
      words: stats.words,
      avgWords: toAvg(stats),
    };
  });

  const perMonthOfYearArray = MONTH_LABELS.map((label, index) => {
    const stats = perMonthOfYear.get(index) ?? { posts: 0, words: 0 };
    return {
      month: index + 1,
      label,
      posts: stats.posts,
      words: stats.words,
      avgWords: toAvg(stats),
    };
  });

  const tagTotalsObject = Object.fromEntries(tagTotals.entries());

  const tagYearlyArray = Array.from(tagYearly.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, tags]) => ({
      year,
      tags: Object.fromEntries(tags.entries()),
    }));

  const totalPosts = entries.length;
  const totalWords = entries.reduce((sum, entry) => sum + entry.words, 0);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      posts: totalPosts,
      words: totalWords,
      avgWords: totalPosts === 0 ? 0 : Math.round((totalWords / totalPosts) * 100) / 100,
    },
    perYear: perYearArray,
    perMonth: perMonthArray,
    perMonthOfYear: perMonthOfYearArray,
    gaps,
    tags: {
      totals: tagTotalsObject,
      yearly: tagYearlyArray,
    },
  };
};
