import 'echarts';

import { useEffect, useState } from 'react';

import { PostsStatsSection } from '@/components/blog/stats/PostsStatsSection';
import { StatsOverview } from '@/components/blog/stats/StatsOverview';
import { StatsSectionNav } from '@/components/blog/stats/StatsSectionNav';
import { TagsStatsSection } from '@/components/blog/stats/TagsStatsSection';
import { WordsStatsSection } from '@/components/blog/stats/WordsStatsSection';
import type { BlogStats } from '@/utils/getBlogStats';

interface BlogStatsChartsProps {
  stats: BlogStats;
}

const BlogStatsCharts = ({ stats }: BlogStatsChartsProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="grid gap-8 lg:gap-10">
      <StatsOverview stats={stats} />
      <StatsSectionNav />
      <PostsStatsSection stats={stats} isDark={isDark} />
      <WordsStatsSection stats={stats} isDark={isDark} />
      <TagsStatsSection stats={stats} isDark={isDark} />
    </div>
  );
};

export default BlogStatsCharts;
