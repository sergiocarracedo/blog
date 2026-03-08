import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../consts';
import { getLocalizedPosts, getRoutingSlug, getLocalizedPostUrl } from '../utils/getLocalizedPosts';

export async function GET(context) {
  const posts = await getLocalizedPosts('en');
  return rss({
    title: `${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: getLocalizedPostUrl(getRoutingSlug(post), 'en'),
    })),
  });
}
