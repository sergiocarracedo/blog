import { getCollection } from 'astro:content';

export const getTags = async (collection: string = 'blog'): Promise<string[]> => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    (post.data.tags || []).forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
};
