import type { CollectionEntry } from 'astro:content';

/**
 * Get the URL path for a post (without locale prefix).
 *
 * - Plain index.mdx → post.id (= frontmatter slug when present, else path-based)
 * - index.en.mdx / index.es.mdx → frontmatter slug if present, else directory name
 *
 * The returned value always starts with '/'.
 * For locale-prefixed URLs call translatePath() on the result.
 */
export const getSlug = (
  post: Pick<CollectionEntry<'blog'>, 'id'> & {
    filePath?: string;
    data?: { slug?: string };
  }
): string => {
  const fp = post.filePath ?? '';

  // Locale-suffixed files (index.es.mdx, index.en.mdx, index.es.t.mdx, index.en.t.mdx):
  // prefer frontmatter slug (mirrors the sibling), else derive from directory
  if (/\/index\.(en|es)(\.t)?\.(md|mdx)$/.test(fp)) {
    if (post.data?.slug) {
      const s = post.data.slug as string;
      return s.startsWith('/') ? s : `/${s}`;
    }
    // Fallback: directory portion of filePath
    const dir = fp
      .replace(/^.*?src\/content\/blog\//, '')
      .replace(/\/index\.(en|es)(\.t)?\.(md|mdx)$/, '');
    return `/${dir}`;
  }

  const slug = post.id;
  if (!slug) return '/';
  return slug.startsWith('/') ? slug : `/${slug}`;
};
