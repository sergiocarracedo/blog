import ReactECharts from 'echarts-for-react';

import {
  chartCardClass,
  getAxisStyles,
  getTooltip,
  toChartTitle,
} from '@/components/blog/stats/chartUtils';
import { StatsSectionHeading } from '@/components/blog/stats/StatsSectionHeading';
import type { BlogStats } from '@/utils/getBlogStats';

interface PostsStatsSectionProps {
  isDark: boolean;
  stats: BlogStats;
}

export const PostsStatsSection = ({ isDark, stats }: PostsStatsSectionProps) => {
  const axisStyles = getAxisStyles(isDark);
  const tooltip = getTooltip(isDark);
  const yearLabels = stats.perYear.map((item) => item.year.toString());
  const yearPosts = stats.perYear.map((item) => item.posts);
  const monthOfYearLabels = stats.perMonthOfYear.map((item) => item.label);
  const monthOfYearPosts = stats.perMonthOfYear.map((item) => item.posts);
  const dayOfWeekLabels = stats.perDayOfWeek.map((item) => item.label);
  const dayOfWeekPosts = stats.perDayOfWeek.map((item) => item.posts);

  return (
    <section id="posts" className="scroll-mt-28 space-y-4">
      <StatsSectionHeading
        title="Posts"
        description="Publishing cadence across years, months, and weekdays for the current language archive."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={`${chartCardClass} xl:col-span-2`}>
          <ReactECharts
            style={{ height: 360 }}
            option={{
              ...toChartTitle('Posts per year', 'Yearly volume across the archive', isDark),
              tooltip,
              grid: { left: 40, right: 20, bottom: 40, top: 70 },
              xAxis: { type: 'category', data: yearLabels, ...axisStyles },
              yAxis: { type: 'value', ...axisStyles },
              series: [
                {
                  name: 'Posts',
                  type: 'line',
                  smooth: true,
                  data: yearPosts,
                  itemStyle: { color: '#90c6be' },
                  areaStyle: { opacity: 0.15 },
                },
              ],
            }}
          />
        </section>

        <section className={chartCardClass}>
          <ReactECharts
            style={{ height: 360 }}
            option={{
              ...toChartTitle('Posts per month', 'Totals per month across all years', isDark),
              tooltip,
              grid: { left: 50, right: 20, bottom: 60, top: 70 },
              xAxis: {
                type: 'category',
                data: monthOfYearLabels,
                ...axisStyles,
                axisLabel: { ...axisStyles.axisLabel, rotate: 45 },
              },
              yAxis: { type: 'value', ...axisStyles },
              series: [
                {
                  name: 'Posts',
                  type: 'bar',
                  data: monthOfYearPosts,
                  itemStyle: { color: '#90c6be' },
                },
              ],
            }}
          />
        </section>

        <section className={chartCardClass}>
          <ReactECharts
            style={{ height: 360 }}
            option={{
              ...toChartTitle(
                'Posts per day of week',
                'Totals by weekday across all years',
                isDark
              ),
              tooltip,
              grid: { left: 50, right: 20, bottom: 60, top: 70 },
              xAxis: {
                type: 'category',
                data: dayOfWeekLabels,
                ...axisStyles,
              },
              yAxis: { type: 'value', ...axisStyles },
              series: [
                {
                  name: 'Posts',
                  type: 'bar',
                  data: dayOfWeekPosts,
                  itemStyle: { color: '#90c6be' },
                },
              ],
            }}
          />
        </section>
      </div>
    </section>
  );
};
