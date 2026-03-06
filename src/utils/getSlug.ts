import type { CollectionEntry } from 'astro:content';

/**
 * Get the URL path for a post.
 *
 * For regular posts, this is `/{post.id}` (which equals the frontmatter `slug` when present).
 *
 * For co-located translation files (index.es.mdx / index.en.mdx), the glob loader
 * assigns a path-based ID (e.g. `2026/my-post/index.es`). The correct URL slug is the
 * base post's frontmatter `slug` field (if present on the translation) or the directory
 * portion of the filePath. Either way, the URL must match what `es/[...slug].astro`
 * generates as the route param (which is `basePost.id`).
 */
export const getSlug = (
  post: Pick<CollectionEntry<'blog'>, 'id'> & { filePath?: string; data?: { slug?: string } }
) => {
  const fp = post.filePath ?? '';

  // Translation files have path-based IDs (e.g. 2026/my-post/index.es).
  // The route param is the base post's slug. If the translation file has a frontmatter
  // `slug` field, it mirrors the base post's slug — use it directly.
  if (/\/index\.(en|es)\.(md|mdx)$/.test(fp)) {
    // Prefer the frontmatter slug if available (it mirrors the base post's slug)
    if (post.data?.slug) {
      const s = post.data.slug as string;
      return s.startsWith('/') ? s : `/${s}`;
    }
    // Fallback: derive from directory portion of filePath
    const dir = fp
      .replace(/^.*?src\/content\/blog\//, '')
      .replace(/\/index\.(en|es)\.(md|mdx)$/, '');
    return `/${dir}`;
  }

  const slug = post?.id;
  if (!slug) return '/';
  return slug.startsWith('/') ? slug : `/${slug}`;
};
