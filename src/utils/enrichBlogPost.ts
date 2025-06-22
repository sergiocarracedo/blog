import { createExcerpt } from './excerpt';
import { getSlug } from './getSlug';

export interface EnrichedPost<T = any> {
  data: T;
  body: string;
  slug?: string;
  readingTime: number;
  excerpt: string;
}

export function enrichBlogPost<T = any>(entry: {
  id: string;
  body?: string;
  data: T;
}): EnrichedPost<T> {
  const words = entry.body?.trim().split(/\s+/).length || 0;
  const readingTime = Math.ceil(words / 200);
  const excerpt = createExcerpt(entry?.body || '');

  return {
    ...entry,
    readingTime,
    excerpt,
    body: entry.body || '',
    slug: getSlug(entry),
  };
}
