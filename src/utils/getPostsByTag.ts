import { type CollectionEntry, type CollectionKey, getCollection } from 'astro:content';

export const getPostsByTag = async <C extends CollectionKey>(
  tag: string,
  collection: C
): Promise<Array<CollectionEntry<C>>> => {
  const posts = await getCollection(collection);

  return posts
    .filter((post) => (post.data.tags || []).includes(tag))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
};
