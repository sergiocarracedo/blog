import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

import type { BlogStats } from '@/utils/getBlogStats';

interface BlogStatsChartsProps {
  stats: BlogStats;
}

const numberFormatter = new Intl.NumberFormat('en-US');

const toChartTitle = (title: string, subtitle?: string, isDark = false) => ({
  title: {
    text: title,
    subtext: subtitle,
    left: 'center',
    textStyle: {
      color: isDark ? '#e5e7eb' : '#333',
      fontWeight: 600,
      fontSize: 16,
    },
    subtextStyle: {
      color: isDark ? '#9ca3af' : '#666',
    },
  },
});

const getAxisStyles = (isDark = false) => ({
  axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
  axisTick: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
  axisLabel: { color: isDark ? '#9ca3af' : '#6b7280' },
  splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb' } },
});

const getTooltip = (isDark = false) => ({
  trigger: 'axis' as const,
  backgroundColor: isDark ? '#1f2937' : '#ffffff',
  borderColor: isDark ? '#4b5563' : '#d1d5db',
  textStyle: { color: isDark ? '#f9fafb' : '#111827' },
});

const formatTagTooltip = (
  params: Array<{ axisValue?: string; seriesName?: string; value?: number }>
) => {
  if (!Array.isArray(params) || params.length === 0) {
    return '';
  }
  const axisValue = params[0]?.axisValue ?? '';
  const lines = params
    .filter((item) => (item.value ?? 0) > 0)
    .map((item) => `${item.seriesName}: ${item.value}`);

  return [axisValue, ...lines].join('<br/>');
};

const BlogStatsCharts: React.FC<BlogStatsChartsProps> = ({ stats }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const axisStyles = getAxisStyles(isDark);
  const tooltip = getTooltip(isDark);

  const yearLabels = stats.perYear.map((item) => item.year.toString());
  const yearPosts = stats.perYear.map((item) => item.posts);
  const yearWords = stats.perYear.map((item) => item.words);
  const yearAvg = stats.perYear.map((item) => item.avgWords);

  const monthLabels = stats.perMonth.map((item) => item.month);
  const monthWords = stats.perMonth.map((item) => item.words);
  const monthAvg = stats.perMonth.map((item) => item.avgWords);

  const monthOfYearLabels = stats.perMonthOfYear.map((item) => item.label);
  const monthOfYearPosts = stats.perMonthOfYear.map((item) => item.posts);
  const dayOfWeekLabels = stats.perDayOfWeek.map((item) => item.label);
  const dayOfWeekPosts = stats.perDayOfWeek.map((item) => item.posts);

  const tagYears = stats.tags.yearly.map((item) => item.year.toString());
  const allTags = Object.entries(stats.tags.totals)
    .sort(([, a], [, b]) => b - a)
    .map(([tag]) => tag);
  const tagYearSeries = allTags.map((tag) => ({
    name: tag,
    type: 'bar',
    stack: 'tags',
    emphasis: { focus: 'series' },
    data: stats.tags.yearly.map((item) => item.tags[tag] ?? 0),
  }));

  return (
    <div className="grid gap-10">
      <section className="bg-secondary/40 dark:bg-primary-700/40 border border-secondary dark:border-primary-600 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 text-primary dark:text-secondary">
          <div>
            <h3 className="text-xl font-semibold">Overview</h3>
            <p className="text-primary dark:text-gray-400 text-sm">
              Generated at {stats.generatedAt}
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-right">
            <div>
              <div className="text-primary dark:text-gray-400">Posts</div>
              <div className="text-lg font-semibold">
                {numberFormatter.format(stats.totals.posts)}
              </div>
            </div>
            <div>
              <div className="text-primary dark:text-gray-400">Words</div>
              <div className="text-lg font-semibold">
                {numberFormatter.format(stats.totals.words)}
              </div>
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

      <section className="bg-gray-50/80 dark:bg-primary/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-primary-700">
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
                type: 'bar',
                data: yearPosts,
                itemStyle: { color: '#90c6be' },
              },
            ],
          }}
        />
      </section>

      <section className="bg-gray-50/80 dark:bg-primary/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-primary-700">
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
                smooth: true,
                data: monthOfYearPosts,
                itemStyle: { color: '#90c6be' },
                areaStyle: { opacity: 0.15 },
              },
            ],
          }}
        />
      </section>

      <section className="bg-gray-50/80 dark:bg-primary/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-primary-700">
        <ReactECharts
          style={{ height: 360 }}
          option={{
            ...toChartTitle('Posts per day of week', 'Totals by weekday across all years', isDark),
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
                areaStyle: { opacity: 0.15 },
              },
            ],
          }}
        />
      </section>

      <section className="bg-gray-50/80 dark:bg-primary/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-primary-700">
        <ReactECharts
          style={{ height: 360 }}
          option={{
            ...toChartTitle('Words per year', undefined, isDark),
            tooltip,
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

      <section className="bg-gray-50/80 dark:bg-primary/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-primary-700">
        <ReactECharts
          style={{ height: 360 }}
          option={{
            ...toChartTitle('Words per month', undefined, isDark),
            tooltip,
            grid: { left: 50, right: 20, bottom: 60, top: 70 },
            xAxis: {
              type: 'category',
              data: monthLabels,
              ...axisStyles,
              axisLabel: { ...axisStyles.axisLabel, rotate: 45 },
            },
            yAxis: { type: 'value', ...axisStyles },
            legend: {
              top: 45,
              textStyle: { color: isDark ? '#9ca3af' : '#666' },
            },
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

      <section className="bg-gray-50/80 dark:bg-primary/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-primary-700">
        <ReactECharts
          style={{ height: 420 }}
          option={{
            ...toChartTitle('Tags usage by year', 'All tags stacked by year', isDark),
            tooltip: {
              ...tooltip,
              formatter: formatTagTooltip,
            },
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
  );
};

export default BlogStatsCharts;
