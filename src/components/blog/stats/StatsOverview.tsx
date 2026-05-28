import { numberFormatter } from '@/components/blog/stats/chartUtils';
import type { BlogStats } from '@/utils/getBlogStats';

interface StatsOverviewProps {
  stats: BlogStats;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => (
  <section className="bg-secondary/40 dark:bg-primary-700/40 border border-secondary dark:border-primary-600 rounded-2xl p-6 backdrop-blur-sm">
    <div className="flex flex-wrap items-center justify-between gap-4 text-primary dark:text-secondary">
      <div>
        <h3 className="text-xl font-semibold">Overview</h3>
        <p className="text-primary dark:text-gray-400 text-sm">Generated at {stats.generatedAt}</p>
      </div>
      <div className="flex flex-wrap gap-6 text-sm text-right">
        <div>
          <div className="text-primary dark:text-gray-400">Posts</div>
          <div className="text-lg font-semibold">{numberFormatter.format(stats.totals.posts)}</div>
        </div>
        <div>
          <div className="text-primary dark:text-gray-400">Words</div>
          <div className="text-lg font-semibold">{numberFormatter.format(stats.totals.words)}</div>
        </div>
        <div>
          <div className="text-primary dark:text-gray-400">Avg words</div>
          <div className="text-lg font-semibold">
            {numberFormatter.format(stats.totals.avgWords)}
          </div>
        </div>
      </div>
    </div>
  </section>
);
