import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { Locale } from '@/i18n';

/**
 * Check if a post is a co-located translation file.
 * Uses filePath (actual file path on disk) to detect files named index.es.mdx / index.en.mdx.
 * This is reliable even when frontmatter `slug` overrides post.id.
 */
export function isTranslationFile(post: CollectionEntry<'blog'>): boolean {
  return /\/index\.(en|es)\.(md|mdx)$/.test((post as any).filePath ?? '');
}

/**
 * Derive the locale suffix from a translation file's filePath.
 * Returns 'es' for `…/index.es.mdx`, etc.
 */
export function getTranslationLocale(post: CollectionEntry<'blog'>): Locale | null {
  const match = ((post as any).filePath ?? '').match(/\/index\.(en|es)\.(md|mdx)$/);
  return match ? (match[1] as Locale) : null;
}

/**
 * Get the "base post ID" string for matching base+translation post pairs.
 * This strips any /index.{lang} suffix from path-based IDs used by translation files.
 * Note: base posts may have frontmatter-slug IDs (e.g. "use-a-mac-as-a-normal-pc"),
 * so use getPostDirectory() for reliable base+translation matching instead.
 */
export function getBasePostId(postId: string): string {
  return postId.replace(/\/index\.(en|es)$/, '');
}

/**
 * Get the directory key for a post, derived from its filePath.
 * Used to match base posts with their co-located translation files.
 * e.g. "src/content/blog/2026/2026-01-31-mac-mierda/index.mdx"   → "2026/2026-01-31-mac-mierda"
 *      "src/content/blog/2026/2026-01-31-mac-mierda/index.es.mdx" → "2026/2026-01-31-mac-mierda"
 */
export function getPostDirectory(post: CollectionEntry<'blog'>): string {
  const fp: string = (post as any).filePath ?? '';
  return fp.replace(/^.*?src\/content\/blog\//, '').replace(/\/index(\.(en|es))?\.(md|mdx)$/, '');
}

/**
 * Get the slug used for routing (i.e. the URL path segment).
 * For base posts this is post.id (which equals frontmatter slug when present).
 * For translation files this is the base post's slug (same directory, found by filePath).
 * The translation is served under the same slug as its base post.
 */
export function getRoutingSlug(post: CollectionEntry<'blog'>): string {
  return post.id;
}

/**
 * Given a post's filePath, find the corresponding base post (non-translation) in the collection.
 * Returns the base post, or the post itself if it IS the base post.
 */
export async function getBasePost(
  post: CollectionEntry<'blog'>
): Promise<CollectionEntry<'blog'> | undefined> {
  if (!isTranslationFile(post)) return post;
  const dir = getPostDirectory(post);
  const allPosts = await getCollection('blog');
  return allPosts.find((p) => !isTranslationFile(p) && getPostDirectory(p) === dir);
}

/**
 * Get posts filtered by locale
 *
 * Rules:
 * - Translation files (index.es.mdx / index.en.mdx) only appear in their locale
 * - Posts with explicit `lang` field only appear in that language
 * - Posts without `lang` appear in both languages
 */
export async function getLocalizedPosts(
  locale: Locale,
  sortBy: 'pubDate' | 'updatedDate' = 'pubDate'
): Promise<CollectionEntry<'blog'>[]> {
  const allPosts = await getCollection('blog');

  const filteredPosts = allPosts.filter((post) => {
    // Co-located translation files: only show in their target locale
    if (isTranslationFile(post)) {
      return getTranslationLocale(post) === locale;
    }

    const postLang = post.data.lang;

    // No lang field → show in both languages
    if (!postLang) {
      return true;
    }

    // Original post with lang → only show in that language
    return postLang === locale;
  });

  // Sort by date
  return filteredPosts.sort(
    (a, b) => (b.data[sortBy] as Date).valueOf() - (a.data[sortBy] as Date).valueOf()
  );
}

/**
 * Get post translations
 * Returns both English and Spanish versions of a post if available.
 * Uses co-location: looks for index.mdx (base) and index.es.mdx / index.en.mdx siblings.
 * Matching is done by directory (filePath), not post.id, to handle frontmatter slugs correctly.
 */
export async function getPostTranslations(
  post: CollectionEntry<'blog'>
): Promise<{ en?: CollectionEntry<'blog'>; es?: CollectionEntry<'blog'> }> {
  const allPosts = await getCollection('blog');
  const dir = getPostDirectory(post);

  const result: { en?: CollectionEntry<'blog'>; es?: CollectionEntry<'blog'> } = {};

  for (const p of allPosts) {
    if (getPostDirectory(p) !== dir) continue;

    if (isTranslationFile(p)) {
      const locale = getTranslationLocale(p);
      if (locale) result[locale] = p;
    } else {
      const postLang = p.data.lang;
      if (!postLang) {
        result.en = result.en || p;
        result.es = result.es || p;
      } else {
        result[postLang] = p;
      }
    }
  }

  return result;
}

/**
 * For a given post, return the correct EN and ES URLs to use in the language switcher.
 *
 * Rules:
 * - The EN URL always uses the base post's id (= frontmatter slug or path-based id)
 * - The ES URL uses:
 *   - /es/{basePost.id} if there is no Spanish translation file
 *   - /es/{basePost.id} even when there IS a translation (translation is served at same slug)
 */
export async function getPostSwitcherUrls(
  post: CollectionEntry<'blog'>
): Promise<{ en: string; es: string }> {
  const allPosts = await getCollection('blog');
  const dir = getPostDirectory(post);

  // Find the base post for this directory
  const basePost = allPosts.find((p) => !isTranslationFile(p) && getPostDirectory(p) === dir);
  const baseSlug = basePost?.id ?? post.id;

  const enUrl = `/${baseSlug}`;
  const esUrl = `/es/${baseSlug}`;

  return { en: enUrl, es: esUrl };
}

/**
 * Get the URL for a post in a specific locale
 */
export function getLocalizedPostUrl(
  slug: string,
  locale: Locale,
  defaultLocale: Locale = 'en'
): string {
  if (locale === defaultLocale) {
    return `/${slug}`;
  }
  return `/${locale}/${slug}`;
}

/**
 * Get all unique tags from localized posts
 */
export async function getLocalizedTags(locale: Locale): Promise<string[]> {
  const posts = await getLocalizedPosts(locale);
  const tagSet = new Set<string>();

  for (const post of posts) {
    const tags = post.data.tags ?? [];
    for (const tag of tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

/**
 * Get posts by tag for a specific locale
 */
export async function getLocalizedPostsByTag(
  locale: Locale,
  tag: string
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getLocalizedPosts(locale);
  return posts.filter((post) => post.data.tags?.includes(tag));
}

/**
 * Get posts by year for a specific locale
 */
export async function getLocalizedPostsByYear(
  locale: Locale
): Promise<Map<number, CollectionEntry<'blog'>[]>> {
  const posts = await getLocalizedPosts(locale);
  const byYear = new Map<number, CollectionEntry<'blog'>[]>();

  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    if (!byYear.has(year)) {
      byYear.set(year, []);
    }
    byYear.get(year)!.push(post);
  }

  return byYear;
}
