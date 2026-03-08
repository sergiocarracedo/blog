import rss from '@astrojs/rss';
import { locales, defaultLocale } from '@/i18n';
import { SITE_TITLE, SITE_URL } from '../../consts';
import {
  getLocalizedPosts,
  getRoutingSlug,
  getLocalizedPostUrl,
} from '../../utils/getLocalizedPosts';

export function getStaticPaths() {
  return locales.filter((l) => l !== defaultLocale).map((l) => ({ params: { lang: l } }));
}

export async function GET(context) {
  const lang = context.params.lang;
  const posts = await getLocalizedPosts(lang);

  const titles = { es: `${SITE_TITLE} | ES` };
  const descriptions = { es: 'Blog personal de Sergio Carracedo.' };

  return rss({
    title: titles[lang] ?? `${SITE_TITLE} | ${lang.toUpperCase()}`,
    description: descriptions[lang] ?? '',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: getLocalizedPostUrl(getRoutingSlug(post), lang),
    })),
  });
}
