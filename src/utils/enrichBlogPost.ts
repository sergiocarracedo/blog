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
  filePath?: string;
  data: T & { excerpt?: string };
}): EnrichedPost<T> {
  const words = entry.body?.trim().split(/\s+/).length || 0;
  const readingTime = Math.ceil(words / 200);
  // Use manual excerpt from frontmatter if available, otherwise generate from body
  const excerpt = entry.data.excerpt || createExcerpt(entry?.body || '');

  // For view transition names: use the slug (URL path) rather than the raw ID,
  // so that base post and translation share the same sanitized key.
  const slug = getSlug(entry);
  const sanitizedId = slug.replace(/^\//, '').replaceAll('/', '-');

  return {
    ...entry,
    readingTime,
    excerpt,
    body: entry.body || '',
    slug,
    sanitizedId,
  };
}
