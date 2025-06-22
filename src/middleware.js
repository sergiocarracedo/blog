// Astro middleware for redirecting old blog slugs with slashes to new dash-based slugs
import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  // Match old slug pattern: /2019/05/12/Mi-historico-de-telefonos-moviles/
  const match = url.pathname.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/?$/);
  if (match) {
    const [ , year, month, day, slug ] = match;
    const newSlug = `${slug}`;
    return context.redirect(`/${newSlug}`, 301);
  }


  // Match index.xml redirect to rss.xml
  if (url.pathname === '/index.xml') {
    return context.redirect('/rss.xml', 301);
  }
  return next();
});
