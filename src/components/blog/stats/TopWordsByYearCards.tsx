import { useState } from 'react';

import { chartCardClass, wordCountFormatter } from '@/components/blog/stats/chartUtils';
import type { BlogStats } from '@/utils/getBlogStats';

interface TopWordsByYearCardsProps {
  topWordsByYear: BlogStats['topWordsByYear'];
}

const getRankTextClass = (index: number) => {
  if (index === 0) {
    return 'text-secondary';
  }

  if (index === 1) {
    return 'text-slate-200';
  }

  if (index === 2) {
    return 'text-amber-200';
  }

  return 'text-primary dark:text-secondary';
};

export const TopWordsByYearCards = ({ topWordsByYear }: TopWordsByYearCardsProps) => {
  const [showAllYears, setShowAllYears] = useState(false);
  const sortedYears = [...topWordsByYear].sort((a, b) => b.year - a.year);

  return (
    <section className={`${chartCardClass} p-5`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-primary dark:text-secondary">
            Top words by year
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-primary dark:text-gray-400">
            Top 12 are preserved for each year. By default only the top 3 are shown, and the toggle
            expands or collapses the rest.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAllYears((current) => !current);
          }}
          aria-expanded={showAllYears}
          className="inline-flex items-center rounded-full border border-secondary/70 bg-secondary/50 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-secondary/70 dark:border-primary-500 dark:bg-primary-700/70 dark:text-secondary dark:hover:bg-primary-700"
        >
          {showAllYears ? 'Show top 3 only' : 'Show top 12'}
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {sortedYears.map((yearly) => {
          const isExpanded = showAllYears;
          const visibleWords = isExpanded ? yearly.words : yearly.words.slice(0, 3);

          return (
            <article key={yearly.year} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="text-base font-semibold text-primary dark:text-secondary">
                  {yearly.year}
                </h4>
                <span className="text-[11px] text-primary/60 dark:text-gray-400">
                  {isExpanded ? `Top ${yearly.words.length}` : 'Top 3'}
                </span>
              </div>

              <ul className="space-y-1">
                {visibleWords.map((entry, index) => (
                  <li
                    key={`${yearly.year}-${entry.word}`}
                    className="flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5"
                  >
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold ${getRankTextClass(index)}`}
                    >
                      #{index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-primary dark:text-secondary">
                      {entry.word}
                    </span>
                    <span className="shrink-0 text-xs text-primary/70 dark:text-gray-400">
                      {wordCountFormatter.format(entry.count)}
                    </span>
                  </li>
                ))}
              </ul>

              {!isExpanded && yearly.words.length > 3 ? (
                <p className="mt-2 text-[11px] text-primary/70 dark:text-gray-400">
                  {yearly.words.length - 3} more words hidden
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};
