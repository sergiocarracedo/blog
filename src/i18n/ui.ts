/**
 * UI Translation Dictionary
 * Contains all translatable UI strings for the blog
 */

import type { Locale } from './config';

export const ui: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.byYear': 'By Year',
    'nav.about': 'About',
    'nav.tags': 'Tags',

    // Site
    'site.description':
      'Sergio Carracedo personal blog. Here I share my thoughts, experiences, and knowledge on software development, technology, and life in general.',
    'site.authorPosition': 'Senior Fullstack Engineer | AI Implementation | DX & Design Systems',
    'site.authorDescription': 'Always learning, cats, good conversations and small details lover.',

    // Post
    'post.readMore': 'Read more',
    'post.backToBlog': 'Back to blog',
    'post.allPosts': 'All Blog posts',
    'post.minuteRead': '{count} minute read',
    'post.minutesRead': '{count} minutes read',
    'post.publishedOn': 'Published on',
    'post.updatedOn': 'Updated on',
    'post.nextPost': 'Next post',
    'post.prevPost': 'Previous post',
    'post.tags': 'Tags',
    'post.pictureBy': 'Picture by',
    'post.prompt': 'Prompt',
    'post.licence': 'Licence',
    'post.commentsCookiePolicy': 'To comment or view comments you need to accept cookie policy.',

    // Auto-translation notice
    'translation.auto': 'This post was automatically translated from {lang}.',
    'translation.viewOriginal': 'View original',
    'translation.switchTo': 'Read in {lang}',
    'translation.aiTranslated': 'AI Translated',
    'translation.notAvailable':
      'This post is not yet available in Spanish. You are reading the original English version.',

    // Pagination
    'pagination.first': 'First page',
    'pagination.previous': 'Previous page',
    'pagination.next': 'Next page',
    'pagination.last': 'Last page',
    'pagination.page': 'Page {current} of {total}',
    'pagination.goToPage': 'Page {num}',

    // 404
    '404.title': '404 - Page Not Found',
    '404.subtitle': "We couldn't find that page.",
    '404.message': 'You tried to visit a missing page.',
    '404.searchPrompt': 'Try searching for something similar below:',
    '404.orGoHome': 'Or you can go back to the homepage:',
    '404.goHome': 'Go to Homepage',

    // Footer
    'footer.copyright': '© {year} Sergio Carracedo. All rights reserved.',
    'footer.blogStats': 'Blog stats',
    'footer.newsletter': 'Newsletter',
    'footer.rss': 'RSS Feed',

    // Hero
    'hero.moreAbout': 'More about me',

    // Search
    'search.placeholder': 'Search...',
    'search.noResults': 'No results found',

    // Dates (used for formatting context)
    'date.locale': 'en-US',

    // Blog listing
    'blog.title': 'Blog',
    'blog.latestPosts': 'Latest Posts',
    'blog.postsInYear': 'Posts in {year}',
    'blog.postsWithTag': 'Posts tagged with "{tag}"',

    // Newsletter
    'newsletter.title': 'Newsletter',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.unsubscribe': 'Unsubscribe',

    // Legal
    'legal.cookiePolicy': 'Cookie Policy',

    // Accessibility
    'a11y.skipToContent': 'Skip to content',
    'a11y.mainNavigation': 'Main navigation',
    'a11y.pages': 'Pages',

    // Language switcher
    'lang.switchTo': 'Switch to {lang}',
    'lang.currentLanguage': 'Current language: {lang}',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.blog': 'Blog',
    'nav.byYear': 'Por Año',
    'nav.about': 'Sobre mí',
    'nav.tags': 'Etiquetas',

    // Site
    'site.description':
      'Blog personal de Sergio Carracedo. Aquí comparto mis pensamientos, experiencias y conocimientos sobre desarrollo de software, tecnología y la vida en general.',
    'site.authorPosition': 'Senior Fullstack Engineer | Implementación IA | DX & Design Systems',
    'site.authorDescription':
      'Siempre aprendiendo, amante de los gatos, las buenas conversaciones y los pequeños detalles.',

    // Post
    'post.readMore': 'Leer más',
    'post.backToBlog': 'Volver al blog',
    'post.allPosts': 'Todos los posts',
    'post.minuteRead': '{count} minuto de lectura',
    'post.minutesRead': '{count} minutos de lectura',
    'post.publishedOn': 'Publicado el',
    'post.updatedOn': 'Actualizado el',
    'post.nextPost': 'Siguiente post',
    'post.prevPost': 'Post anterior',
    'post.tags': 'Etiquetas',
    'post.pictureBy': 'Imagen de',
    'post.prompt': 'Prompt',
    'post.licence': 'Licencia',
    'post.commentsCookiePolicy':
      'Para comentar o ver comentarios necesitas aceptar la política de cookies.',

    // Auto-translation notice
    'translation.auto': 'Este post fue traducido automáticamente del {lang}.',
    'translation.viewOriginal': 'Ver original',
    'translation.switchTo': 'Leer en {lang}',
    'translation.aiTranslated': 'Traducido por IA',
    'translation.notAvailable':
      'Este post aún no está disponible en español. Estás leyendo la versión original en inglés.',

    // Pagination
    'pagination.first': 'Primera página',
    'pagination.previous': 'Página anterior',
    'pagination.next': 'Página siguiente',
    'pagination.last': 'Última página',
    'pagination.page': 'Página {current} de {total}',
    'pagination.goToPage': 'Página {num}',

    // 404
    '404.title': '404 - Página no encontrada',
    '404.subtitle': 'No pudimos encontrar esa página.',
    '404.message': 'Intentaste visitar una página que no existe.',
    '404.searchPrompt': 'Intenta buscar algo similar a continuación:',
    '404.orGoHome': 'O puedes volver a la página principal:',
    '404.goHome': 'Ir al Inicio',

    // Footer
    'footer.copyright': '© {year} Sergio Carracedo. Todos los derechos reservados.',
    'footer.blogStats': 'Estadísticas del blog',
    'footer.newsletter': 'Boletín',
    'footer.rss': 'RSS Feed',

    // Hero
    'hero.moreAbout': 'Más sobre mí',

    // Search
    'search.placeholder': 'Buscar...',
    'search.noResults': 'No se encontraron resultados',

    // Dates (used for formatting context)
    'date.locale': 'es-ES',

    // Blog listing
    'blog.title': 'Blog',
    'blog.latestPosts': 'Últimos Posts',
    'blog.postsInYear': 'Posts en {year}',
    'blog.postsWithTag': 'Posts con la etiqueta "{tag}"',

    // Newsletter
    'newsletter.title': 'Boletín',
    'newsletter.subscribe': 'Suscribirse',
    'newsletter.unsubscribe': 'Darse de baja',

    // Legal
    'legal.cookiePolicy': 'Política de Cookies',

    // Accessibility
    'a11y.skipToContent': 'Saltar al contenido',
    'a11y.mainNavigation': 'Navegación principal',
    'a11y.pages': 'Páginas',

    // Language switcher
    'lang.switchTo': 'Cambiar a {lang}',
    'lang.currentLanguage': 'Idioma actual: {lang}',
  },
};

/**
 * Get a specific translation key
 */
export function getTranslation(locale: Locale, key: string): string {
  return ui[locale][key] ?? ui['en'][key] ?? key;
}
