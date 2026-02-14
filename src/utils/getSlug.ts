import type { CollectionEntry } from 'astro:content';

export const getSlug = (post: Pick<CollectionEntry<'blog'>, 'id'>) => {
  const slug = post?.id;
  if (!slug) return '/';
  return slug.startsWith('/') ? slug : `/${slug}`;
};
