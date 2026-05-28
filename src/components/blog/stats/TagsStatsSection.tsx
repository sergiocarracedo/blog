import ReactECharts from 'echarts-for-react';

import {
  chartCardClass,
  getAxisStyles,
  getTooltip,
  toChartTitle,
} from '@/components/blog/stats/chartUtils';
import { StatsSectionHeading } from '@/components/blog/stats/StatsSectionHeading';
import type { BlogStats } from '@/utils/getBlogStats';

interface TagsStatsSectionProps {
  isDark: boolean;
  stats: BlogStats;
}

const getAllTags = (stats: BlogStats) =>
  Object.entries(stats.tags.totals)
    .sort(([, a], [, b]) => b - a)
    .map(([tag]) => tag);

const getTagYearSeries = (stats: BlogStats, allTags: string[]) =>
  allTags.map((tag) => ({
    name: tag,
    type: 'bar',
    stack: 'tags',
    emphasis: { focus: 'series' },
    data: stats.tags.yearly.map((item) => item.tags[tag] ?? 0),
  }));

export const TagsStatsSection = ({ isDark, stats }: TagsStatsSectionProps) => {
  const axisStyles = getAxisStyles(isDark);
  const tooltip = getTooltip(isDark);
  const tagYears = stats.tags.yearly.map((item) => item.year.toString());
  const allTags = getAllTags(stats);
  const tagYearSeries = getTagYearSeries(stats, allTags);

  return (
    <section id="tags" className="scroll-mt-28 space-y-4">
      <StatsSectionHeading
        title="Tags"
        description="Tag activity over time for the current language archive."
      />

      <div className="grid gap-4">
        <section className={chartCardClass}>
          <ReactECharts
            style={{ height: 420 }}
            option={{
              ...toChartTitle('Tags usage by year', 'All tags stacked by year', isDark),
              tooltip,
              legend: {
                type: 'scroll',
                orient: 'horizontal',
                top: 45,
                left: 'center',
                width: '80%',
                data: allTags,
                textStyle: { color: isDark ? '#9ca3af' : '#666' },
              },
              grid: { left: 50, right: 20, bottom: 50, top: 90 },
              xAxis: {
                type: 'category',
                data: tagYears,
                ...axisStyles,
              },
              yAxis: { type: 'value', ...axisStyles },
              series: tagYearSeries,
            }}
          />
        </section>
      </div>
    </section>
  );
};
