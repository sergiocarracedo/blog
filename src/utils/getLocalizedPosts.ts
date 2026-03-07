import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { Locale } from '@/i18n';

/**
 * Check if a post is a locale-suffixed file (index.es.mdx or index.en.mdx).
 * Both ES-originals renamed to index.es.mdx AND EN translations of ES-originals (index.en.mdx)
 * are "locale files". Plain index.mdx is the legacy EN-original format.
 */
export function isLocaleFile(post: CollectionEntry<'blog'>): boolean {
  return /\/index\.(en|es)\.(md|mdx)$/.test((post as any).filePath ?? '');
}

/** @deprecated Use isLocaleFile */
export const isTranslationFile = isLocaleFile;

/**
 * Derive the locale from a locale file's filePath.
 * Returns 'es' for `…/index.es.mdx`, 'en' for `…/index.en.mdx`, null for plain index.mdx.
 */
export function getFileLocale(post: CollectionEntry<'blog'>): Locale | null {
  const match = ((post as any).filePath ?? '').match(/\/index\.(en|es)\.(md|mdx)$/);
  return match ? (match[1] as Locale) : null;
}

/** @deprecated Use getFileLocale */
export const getTranslationLocale = getFileLocale;

/**
 * Get the directory key for a post, derived from its filePath.
 * Used to match co-located locale files within the same folder.
 * e.g. "src/content/blog/2026/2026-01-31-mac-mierda/index.es.mdx" → "2026/2026-01-31-mac-mierda"
 *      "src/content/blog/2010/musica-invisible/index.es.mdx"       → "2010/musica-invisible"
 */
export function getPostDirectory(post: CollectionEntry<'blog'>): string {
  const fp: string = (post as any).filePath ?? '';
  return fp.replace(/^.*?src\/content\/blog\//, '').replace(/\/index(\.(en|es))?\.(md|mdx)$/, '');
}

/**
 * Get the "base post ID" string — strips locale suffix from path-based IDs.
 * Kept for backward compat; prefer getPostDirectory() for matching.
 */
export function getBasePostId(postId: string): string {
  return postId.replace(/\/index\.(en|es)$/, '');
}

/**
 * Get the routing slug for a post — used as the URL path segment.
 *
 * New symmetric model:
 * - Plain index.mdx (EN original)       → post.id (= frontmatter slug or path-based)
 * - index.en.mdx (EN translation/original) → post.data.slug if present, else dir
 * - index.es.mdx (ES original/translation) → post.data.slug if present, else dir
 *
 * This function only returns the slug portion (no locale prefix).
 * Call getLocalizedPostUrl() to get the full locale-prefixed URL.
 */
export function getRoutingSlug(post: CollectionEntry<'blog'>): string {
  if (isLocaleFile(post)) {
    if (post.data.slug) return post.data.slug as string;
    // Fall back to directory name portion of filePath
    return getPostDirectory(post);
  }
  return post.id;
}

/**
 * Get posts filtered by locale.
 *
 * Rules (symmetric for both EN and ES):
 * - index.es.mdx → ES only
 * - index.en.mdx → EN only
 * - index.mdx (plain, lang: en) → EN only
 * - index.mdx (plain, lang: es) → ES only  [legacy, before rename]
 * - index.mdx (plain, no lang)  → both
 */
export async function getLocalizedPosts(
  locale: Locale,
  sortBy: 'pubDate' | 'updatedDate' = 'pubDate'
): Promise<CollectionEntry<'blog'>[]> {
  const allPosts = await getCollection('blog');

  const filteredPosts = allPosts.filter((post) => {
    // Locale-suffixed files are definitively scoped to their locale
    if (isLocaleFile(post)) {
      return getFileLocale(post) === locale;
    }

    const postLang = post.data.lang;

    // No lang field → show in both languages
    if (!postLang) return true;

    // Explicit lang → only show in that language
    return postLang === locale;
  });

  return filteredPosts.sort(
    (a, b) => (b.data[sortBy] as Date).valueOf() - (a.data[sortBy] as Date).valueOf()
  );
}

/**
 * Get all locale variants of a post (same directory).
 * Returns an object with 'en' and/or 'es' entries.
 *
 * For each directory:
 * - index.en.mdx / index.mdx(lang:en) → result.en
 * - index.es.mdx / index.mdx(lang:es) → result.es
 * - index.mdx (no lang)               → both
 */
export async function getPostTranslations(
  post: CollectionEntry<'blog'>
): Promise<{ en?: CollectionEntry<'blog'>; es?: CollectionEntry<'blog'> }> {
  const allPosts = await getCollection('blog');
  const dir = getPostDirectory(post);

  const result: { en?: CollectionEntry<'blog'>; es?: CollectionEntry<'blog'> } = {};

  for (const p of allPosts) {
    if (getPostDirectory(p) !== dir) continue;

    if (isLocaleFile(p)) {
      const locale = getFileLocale(p);
      if (locale) result[locale] = p;
    } else {
      const lang = p.data.lang;
      if (!lang) {
        result.en = result.en || p;
        result.es = result.es || p;
      } else {
        result[lang] = p;
      }
    }
  }

  return result;
}

/**
 * For a given post, return the correct EN and ES switcher URLs.
 *
 * Symmetric model:
 * - EN URL: /{enSlug}  (root, no prefix)
 * - ES URL: /es/{esSlug}
 *
 * The slug for each locale comes from that locale's file (data.slug if present, else dir).
 * If one locale has no file, the switcher falls back to the other locale's URL.
 */
export async function getPostSwitcherUrls(
  post: CollectionEntry<'blog'>
): Promise<{ en: string; es: string }> {
  const translations = await getPostTranslations(post);
  const dir = getPostDirectory(post);

  const enPost = translations.en;
  const esPost = translations.es;

  // Derive the slug for each locale
  const enSlug = enPost
    ? ((enPost.data.slug as string | undefined) ?? (isLocaleFile(enPost) ? dir : enPost.id))
    : null;
  const esSlug = esPost
    ? ((esPost.data.slug as string | undefined) ?? (isLocaleFile(esPost) ? dir : esPost.id))
    : null;

  // Fallback: if no translation for a locale, point to whatever we have
  const fallbackSlug = enSlug ?? esSlug ?? dir;

  const enUrl = `/${enSlug ?? fallbackSlug}`;
  const esUrl = `/es/${esSlug ?? fallbackSlug}`;

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
