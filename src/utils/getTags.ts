import { getCollection } from 'astro:content';
import { createSlug } from './createSlug';

export const getTags = async (collection: string = 'blog'): Promise<Map<string, string>> => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    (post.data.tags || []).forEach((tag) => tagSet.add(tag));
  });

  return new Map<string, string>(
    Array.from(tagSet)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => [createSlug(tag), tag])
  );
};
