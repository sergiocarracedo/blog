import type { CollectionEntry } from 'astro:content';

export const getSlug = (post: Pick<CollectionEntry<'blog'>, 'id'>) => {
  const slug = post.id;
  return slug[0] === '/' ? slug : `/${slug}`;
};
