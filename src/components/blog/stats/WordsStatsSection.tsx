import ReactECharts from 'echarts-for-react';

import {
  chartCardClass,
  getAxisStyles,
  getTooltip,
  toChartTitle,
} from '@/components/blog/stats/chartUtils';
import { StatsSectionHeading } from '@/components/blog/stats/StatsSectionHeading';
import { TopWordsByYearCards } from '@/components/blog/stats/TopWordsByYearCards';
import { TopWordsByYearChart } from '@/components/blog/stats/TopWordsByYearChart';
import type { BlogStats } from '@/utils/getBlogStats';

interface WordsStatsSectionProps {
  isDark: boolean;
  stats: BlogStats;
}

export const WordsStatsSection = ({ isDark, stats }: WordsStatsSectionProps) => {
  const axisStyles = getAxisStyles(isDark);
  const tooltip = getTooltip(isDark);
  const yearLabels = stats.perYear.map((item) => item.year.toString());
  const yearWords = stats.perYear.map((item) => item.words);
  const yearAvg = stats.perYear.map((item) => item.avgWords);
  const monthLabels = stats.perMonth.map((item) => item.month);
  const monthWords = stats.perMonth.map((item) => item.words);
  const monthAvg = stats.perMonth.map((item) => item.avgWords);

  return (
    <section id="words" className="scroll-mt-28 space-y-4">
      <StatsSectionHeading
        title="Words"
        description="Word volume and yearly vocabulary trends based on title, description, and post body."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={chartCardClass}>
          <ReactECharts
            style={{ height: 360 }}
            option={{
              ...toChartTitle('Words per year', 'Total words and average length by year', isDark),
              tooltip,
              legend: {
                top: 45,
                textStyle: { color: isDark ? '#9ca3af' : '#666' },
              },
              grid: { left: 50, right: 20, bottom: 40, top: 70 },
              xAxis: { type: 'category', data: yearLabels, ...axisStyles },
              yAxis: { type: 'value', ...axisStyles },
              series: [
                {
                  name: 'Words',
                  type: 'bar',
                  data: yearWords,
                  itemStyle: { color: isDark ? '#90c6be70' : '#213B4A70' },
                },
                {
                  name: 'Avg words',
                  type: 'line',
                  data: yearAvg,
                  itemStyle: { color: isDark ? '#90c6be' : '#213B4A' },
                },
              ],
            }}
          />
        </section>

        <section className={chartCardClass}>
          <ReactECharts
            style={{ height: 360 }}
            option={{
              ...toChartTitle('Words per month', 'Total words and average length by month', isDark),
              tooltip,
              legend: {
                top: 45,
                textStyle: { color: isDark ? '#9ca3af' : '#666' },
              },
              grid: { left: 50, right: 20, bottom: 60, top: 70 },
              xAxis: {
                type: 'category',
                data: monthLabels,
                ...axisStyles,
                axisLabel: { ...axisStyles.axisLabel, rotate: 45 },
              },
              yAxis: { type: 'value', ...axisStyles },
              series: [
                {
                  name: 'Words',
                  type: 'line',
                  smooth: true,
                  data: monthWords,
                  itemStyle: { color: '#90c6be' },
                  areaStyle: { opacity: 0.15 },
                },
                {
                  name: 'Avg words',
                  type: 'line',
                  smooth: true,
                  data: monthAvg,
                  itemStyle: { color: isDark ? '#e5e7eb' : '#213B4A' },
                },
              ],
            }}
          />
        </section>

        <div className="xl:col-span-2">
          <TopWordsByYearChart isDark={isDark} topWordsByYear={stats.topWordsByYear} />
        </div>

        <div className="xl:col-span-2">
          <TopWordsByYearCards topWordsByYear={stats.topWordsByYear} />
        </div>
      </div>
    </section>
  );
};
