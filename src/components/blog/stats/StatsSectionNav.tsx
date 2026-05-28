const items = [
  { href: '#posts', label: 'Posts' },
  { href: '#words', label: 'Words' },
  { href: '#tags', label: 'Tags' },
] as const;

export const StatsSectionNav = () => (
  <nav className="sticky top-4 z-10 -mx-2 px-2">
    <div className="rounded-2xl border border-gray-200 bg-white/85 p-2 shadow-sm backdrop-blur-sm dark:border-primary-700 dark:bg-primary/90">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex items-center rounded-full border border-secondary/70 bg-secondary/50 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary/70 dark:border-primary-500 dark:bg-primary-700/70 dark:text-secondary dark:hover:bg-primary-700"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  </nav>
);
