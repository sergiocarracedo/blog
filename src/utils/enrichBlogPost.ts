import { createExcerpt } from './excerpt';
import { getSlug } from './getSlug';

export interface EnrichedPost<T = any> {
  data: T;
  body: string;
  slug?: string;
  readingTime: number;
  excerpt: string;
  sanitizedId: string;
}

export function enrichBlogPost<T = any>(entry: {
  id: string;
  body?: string;
  data: T & { excerpt?: string };
}): EnrichedPost<T> {
  const words = entry.body?.trim().split(/\s+/).length || 0;
  const readingTime = Math.ceil(words / 200);
  // Use manual excerpt from frontmatter if available, otherwise generate from body
  const excerpt = entry.data.excerpt || createExcerpt(entry?.body || '');

  return {
    ...entry,
    readingTime,
    excerpt,
    body: entry.body || '',
    slug: getSlug(entry),
    sanitizedId: entry.id.replaceAll('/', ''),
  };
}
