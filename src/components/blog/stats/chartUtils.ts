export const numberFormatter = new Intl.NumberFormat('en-US');
export const wordCountFormatter = new Intl.NumberFormat('en-US');

export const chartCardClass =
  'bg-gray-50/80 dark:bg-primary/95 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-primary-700';

export const toChartTitle = (title: string, subtitle?: string, isDark = false) => ({
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

export const getAxisStyles = (isDark = false) => ({
  axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
  axisTick: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
  axisLabel: { color: isDark ? '#9ca3af' : '#6b7280' },
  splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb' } },
});

export const getTooltip = (isDark = false) => ({
  trigger: 'axis' as const,
  backgroundColor: isDark ? '#1f2937' : '#ffffff',
  borderColor: isDark ? '#4b5563' : '#d1d5db',
  textStyle: { color: isDark ? '#f9fafb' : '#111827' },
});

export const formatTagTooltip = (
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
