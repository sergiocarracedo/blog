interface StatsSectionHeadingProps {
  title: string;
  description: string;
}

export const StatsSectionHeading = ({ title, description }: StatsSectionHeadingProps) => (
  <div className="space-y-1">
    <h2 className="text-2xl font-semibold text-primary dark:text-secondary">{title}</h2>
    <p className="max-w-3xl text-sm text-primary/80 dark:text-gray-400">{description}</p>
  </div>
);
