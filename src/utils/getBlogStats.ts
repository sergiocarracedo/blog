import type { Locale } from '@/i18n';
import { getLocalizedPosts } from '@/utils/getLocalizedPosts';

type MonthKey = string;

interface PerPeriodStats {
  posts: number;
  words: number;
}

interface TimeStats {
  posts: number;
  words: number;
  avgWords: number;
}

interface WordUsage {
  word: string;
  count: number;
}

export interface BlogStats {
  generatedAt: string;
  totals: TimeStats;
  perYear: Array<
    {
      year: number;
    } & TimeStats
  >;
  perMonth: Array<
    {
      month: MonthKey;
    } & TimeStats
  >;
  perMonthOfYear: Array<
    {
      month: number;
      label: string;
    } & TimeStats
  >;
  perDayOfWeek: Array<
    {
      day: number;
      label: string;
    } & TimeStats
  >;
  tags: {
    totals: Record<string, number>;
    yearly: Array<{
      year: number;
      tags: Record<string, number>;
    }>;
  };
  topWordsByYear: Array<{
    year: number;
    words: WordUsage[];
  }>;
}

const TOP_WORDS_PER_YEAR = 12;

const STOPWORDS: Record<Locale, Set<string>> = {
  en: new Set([
    'a',
    'about',
    'after',
    'all',
    'also',
    'an',
    'and',
    'any',
    'are',
    'as',
    'at',
    'be',
    'been',
    'being',
    'but',
    'by',
    'can',
    'could',
    'did',
    'do',
    'does',
    'for',
    'from',
    'had',
    'has',
    'have',
    'how',
    'if',
    'in',
    'into',
    'is',
    'it',
    'its',
    'just',
    'more',
    'most',
    'my',
    'new',
    'not',
    'of',
    'on',
    'one',
    'or',
    'our',
    'out',
    'over',
    'so',
    'some',
    'than',
    'that',
    'the',
    'their',
    'them',
    'there',
    'these',
    'they',
    'this',
    'to',
    'up',
    'use',
    'used',
    'using',
    'was',
    'we',
    'were',
    'what',
    'when',
    'which',
    'who',
    'why',
    'will',
    'with',
    'you',
    'your',
  ]),
  es: new Set([
    'a',
    'al',
    'algo',
    'algun',
    'alguna',
    'algunas',
    'algunos',
    'ante',
    'asi',
    'aunque',
    'como',
    'con',
    'contra',
    'cual',
    'cuando',
    'de',
    'del',
    'desde',
    'donde',
    'dos',
    'el',
    'ella',
    'ellas',
    'ellos',
    'en',
    'entre',
    'era',
    'eran',
    'eres',
    'es',
    'esa',
    'esas',
    'ese',
    'eso',
    'esos',
    'esta',
    'estaba',
    'estado',
    'estan',
    'estar',
    'este',
    'esto',
    'estos',
    'fue',
    'ha',
    'han',
    'hasta',
    'hay',
    'la',
    'las',
    'le',
    'les',
    'lo',
    'los',
    'mas',
    'me',
    'mi',
    'mis',
    'mucho',
    'muy',
    'ni',
    'no',
    'nos',
    'nuestra',
    'nuestro',
    'o',
    'otra',
    'otro',
    'para',
    'pero',
    'por',
    'porque',
    'que',
    'se',
    'sin',
    'sobre',
    'solo',
    'su',
    'sus',
    'te',
    'tambien',
    'tener',
    'tiene',
    'todo',
    'todos',
    'tu',
    'un',
    'una',
    'uno',
    'unos',
    'usar',
    'uso',
    'ya',
    'y',
  ]),
};

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

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getMonthRange = (from: Date, to: Date) => {
  const firstMonthIndex = from.getFullYear() * 12 + from.getMonth();
  const lastMonthIndex = to.getFullYear() * 12 + to.getMonth();
  const totalMonths = lastMonthIndex - firstMonthIndex + 1;

  return Array.from({ length: totalMonths }, (_, offset) => {
    const monthIndex = firstMonthIndex + offset;
    const year = Math.floor(monthIndex / 12);
    const month = monthIndex % 12;

    return toMonthKey(new Date(year, month, 1));
  });
};

const getYearRange = (from: Date, to: Date) => {
  const firstYear = from.getFullYear();
  const lastYear = to.getFullYear();

  return Array.from({ length: lastYear - firstYear + 1 }, (_, offset) => firstYear + offset);
};

const toAvg = (stats: PerPeriodStats) =>
  stats.posts === 0 ? 0 : Math.round((stats.words / stats.posts) * 100) / 100;

const normalizeWord = (word: string) =>
  word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getWords = (text: string, locale: Locale) => {
  const stopwords = STOPWORDS[locale];
  const matches = text.match(/[\p{L}\p{N}]+/gu) ?? [];

  return matches
    .map(normalizeWord)
    .filter((word) => word.length > 1)
    .filter((word) => !/^\d+$/.test(word))
    .filter((word) => !stopwords.has(word));
};

export const getBlogStats = async (locale: Locale): Promise<BlogStats> => {
  const posts = await getLocalizedPosts(locale);

  const entries = posts
    .map((post) => ({
      date: post.data.pubDate,
      words: countWords(post.body ?? ''),
      tags: post.data.tags ?? [],
      text: [post.data.title, post.data.description ?? '', post.body ?? ''].join(' '),
    }))
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());

  const perYear = new Map<number, PerPeriodStats>();
  const perMonth = new Map<MonthKey, PerPeriodStats>();
  const perMonthOfYear = new Map<number, PerPeriodStats>();
  const perDayOfWeek = new Map<number, PerPeriodStats>();
  const tagTotals = new Map<string, number>();
  const tagYearly = new Map<number, Map<string, number>>();
  const topWordsByYear = new Map<number, Map<string, number>>();

  entries.forEach((entry, index) => {
    const year = toYear(entry.date);
    const monthKey = toMonthKey(entry.date);
    const monthIndex = entry.date.getMonth();
    const dayOfWeek = (entry.date.getDay() + 6) % 7;

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

    const dayOfWeekStats = perDayOfWeek.get(dayOfWeek) ?? { posts: 0, words: 0 };
    dayOfWeekStats.posts += 1;
    dayOfWeekStats.words += entry.words;
    perDayOfWeek.set(dayOfWeek, dayOfWeekStats);

    const yearTagStats = tagYearly.get(year) ?? new Map<string, number>();
    const yearWordStats = topWordsByYear.get(year) ?? new Map<string, number>();

    entry.tags.forEach((tag) => {
      const total = (tagTotals.get(tag) ?? 0) + 1;
      tagTotals.set(tag, total);

      yearTagStats.set(tag, (yearTagStats.get(tag) ?? 0) + 1);
    });

    getWords(entry.text, locale).forEach((word) => {
      yearWordStats.set(word, (yearWordStats.get(word) ?? 0) + 1);
    });

    tagYearly.set(year, yearTagStats);
    topWordsByYear.set(year, yearWordStats);
  });

  const yearRange = entries.length
    ? getYearRange(entries[0].date, entries[entries.length - 1].date)
    : [];

  const perYearArray = yearRange.map((year) => {
    const stats = perYear.get(year) ?? { posts: 0, words: 0 };

    return {
      year,
      posts: stats.posts,
      words: stats.words,
      avgWords: toAvg(stats),
    };
  });

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

  const perDayOfWeekArray = WEEKDAY_LABELS.map((label, index) => {
    const stats = perDayOfWeek.get(index) ?? { posts: 0, words: 0 };
    return {
      day: index + 1,
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

  const topWordsByYearArray = Array.from(topWordsByYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, words]) => ({
      year,
      words: Array.from(words.entries())
        .sort(([wordA, countA], [wordB, countB]) => countB - countA || wordA.localeCompare(wordB))
        .slice(0, TOP_WORDS_PER_YEAR)
        .map(([word, count]) => ({ word, count })),
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
    perDayOfWeek: perDayOfWeekArray,
    tags: {
      totals: tagTotalsObject,
      yearly: tagYearlyArray,
    },
    topWordsByYear: topWordsByYearArray,
  };
};
