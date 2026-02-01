import { getBlogStats } from '@/utils/getBlogStats';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const stats = await getBlogStats();

  return new Response(JSON.stringify(stats, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
};
