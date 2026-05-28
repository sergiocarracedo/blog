import { getBlogStats } from '@/utils/getBlogStats';
import { isValidLocale, locales } from '@/i18n';
import type { APIRoute } from 'astro';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang;

  if (!lang || !isValidLocale(lang)) {
    return new Response('Not found', { status: 404 });
  }

  const stats = await getBlogStats(lang);

  return new Response(JSON.stringify(stats, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
