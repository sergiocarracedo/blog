import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
  const posts = await getCollection('blog');
  // English feed: posts without lang (show in both) or explicitly English posts
  // Exclude auto-translated Spanish posts
  const enPosts = posts.filter((post) => !post.data.lang || post.data.lang === 'en');
  return rss({
    title: `${SITE_TITLE} | EN`,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: enPosts
      .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
      .map((post) => ({
        ...post.data,
        link: `${post.id}`,
      })),
  });
}
