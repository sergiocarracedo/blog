import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts';

export async function GET(context) {
  const posts = await getCollection('blog');
  // Spanish feed: posts without lang (show in both) or explicitly Spanish posts
  const esPosts = posts.filter((post) => !post.data.lang || post.data.lang === 'es');
  return rss({
    title: `${SITE_TITLE} | ES`,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: esPosts
      .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
      .map((post) => ({
        ...post.data,
        link: `es/${post.id}`,
      })),
  });
}
