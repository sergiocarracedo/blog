import ReactECharts from 'echarts-for-react';

import {
  chartCardClass,
  getAxisStyles,
  getTooltip,
  toChartTitle,
} from '@/components/blog/stats/chartUtils';
import type { BlogStats } from '@/utils/getBlogStats';

interface TopWordsByYearChartProps {
  isDark: boolean;
  topWordsByYear: BlogStats['topWordsByYear'];
}

const MAX_SERIES = 8;
const SERIES_COLORS = [
  '#90c6be',
  '#213B4A',
  '#d97706',
  '#7c3aed',
  '#2563eb',
  '#be185d',
  '#059669',
  '#ea580c',
];

export const TopWordsByYearChart = ({ isDark, topWordsByYear }: TopWordsByYearChartProps) => {
  const axisStyles = getAxisStyles(isDark);
  const tooltip = getTooltip(isDark);
  const years = [...topWordsByYear].sort((a, b) => a.year - b.year);
  const totalsByWord = new Map<string, { appearances: number; total: number }>();
  const yearWordMap = new Map<number, Map<string, number>>();

  for (const yearly of years) {
    yearWordMap.set(yearly.year, new Map(yearly.words.map((entry) => [entry.word, entry.count])));

    for (const entry of yearly.words) {
      const current = totalsByWord.get(entry.word) ?? { appearances: 0, total: 0 };
      totalsByWord.set(entry.word, {
        appearances: current.appearances + 1,
        total: current.total + entry.count,
      });
    }
  }

  const selectedWords = [...totalsByWord.entries()]
    .sort((a, b) => {
      if (b[1].total !== a[1].total) {
        return b[1].total - a[1].total;
      }

      if (b[1].appearances !== a[1].appearances) {
        return b[1].appearances - a[1].appearances;
      }

      return a[0].localeCompare(b[0]);
    })
    .slice(0, MAX_SERIES)
    .map(([word]) => word);

  if (selectedWords.length === 0) {
    return null;
  }

  return (
    <section className={chartCardClass}>
      <ReactECharts
        style={{ height: 420 }}
        option={{
          ...toChartTitle(
            'Top words by year',
            'Most recurring words across years for this language',
            isDark
          ),
          tooltip,
          legend: {
            type: 'scroll',
            top: 45,
            left: 'center',
            width: '80%',
            textStyle: { color: isDark ? '#9ca3af' : '#666' },
          },
          grid: { left: 50, right: 20, bottom: 50, top: 95 },
          xAxis: {
            type: 'category',
            data: years.map((item) => item.year.toString()),
            ...axisStyles,
          },
          yAxis: { type: 'value', ...axisStyles },
          series: selectedWords.map((word, index) => ({
            name: word,
            type: 'line',
            smooth: true,
            symbolSize: 8,
            lineStyle: { width: 3 },
            itemStyle: { color: SERIES_COLORS[index] },
            data: years.map((yearly) => yearWordMap.get(yearly.year)?.get(word) ?? 0),
          })),
        }}
      />
    </section>
  );
};
