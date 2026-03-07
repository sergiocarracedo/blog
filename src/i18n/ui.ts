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
    'newsletter.stayUpdated': 'Stay Updated',
    'newsletter.digest': 'Get monthly digests of new posts delivered to your inbox',
    'newsletter.emailPlaceholder': 'your@email.com',
    'newsletter.emailLabel': 'Email address',
    'newsletter.subscribing': 'Subscribing…',
    'newsletter.successMessage': 'Success! Check your email to confirm your subscription.',
    'newsletter.errorInvalidEmail': 'Please enter a valid email address',
    'newsletter.errorGeneric': 'Something went wrong. Please try again.',
    'newsletter.errorNetwork': 'Network error. Please check your connection and try again.',
    'newsletter.maybeLater': 'Maybe later',
    'newsletter.close': 'Close',
    // Subscribe page
    'newsletter.subscribePage.title': 'Subscribe to Newsletter',
    'newsletter.subscribePage.description': 'Get monthly digests of new posts',
    'newsletter.subscribePage.whatYouGet': "What You'll Get",
    'newsletter.subscribePage.benefit1': 'Monthly digest of new blog posts',
    'newsletter.subscribePage.benefit2': 'AI-generated summaries of each post',
    'newsletter.subscribePage.benefit3': 'No spam, only quality content about web development',
    'newsletter.subscribePage.benefit4': 'Unsubscribe anytime with one click',
    'newsletter.subscribePage.privacy':
      'I respect your privacy. Your email will only be used for this newsletter.',
    'newsletter.subscribePage.howToUnsubscribe': 'How to unsubscribe',
    'newsletter.subscribePage.backToHome': 'Back to homepage',
    'newsletter.subscribePage.confirmedTitle': 'Subscription Confirmed!',
    'newsletter.subscribePage.confirmedBody':
      "Thank you for subscribing! You'll receive monthly digests of new posts.",
    'newsletter.subscribePage.errorTitle': 'Subscription Error',
    'newsletter.subscribePage.errorInvalid':
      'Invalid confirmation link. Please try subscribing again.',
    'newsletter.subscribePage.errorNotFound': 'Email not found. Please subscribe again.',
    'newsletter.subscribePage.errorInvalidToken':
      'Invalid or corrupted confirmation link. Please try subscribing again.',
    'newsletter.subscribePage.errorExpired':
      'Confirmation link has expired. Please subscribe again.',
    'newsletter.subscribePage.errorServer': 'Something went wrong. Please try again later.',
    'newsletter.subscribePage.errorFallback': 'An error occurred. Please try again.',

    // Legal — Cookie Policy page
    'legal.cookiePolicy': 'Cookie Policy',
    'legal.cookie.intro':
      'This website, like many others, uses cookies to improve your experience as a user. In compliance with applicable law, we will inform you about what they are, which ones we use, how to delete them, and we will ask for your consent for their use.',
    'legal.cookie.infoHeading': 'INFORMATION',
    'legal.cookie.whatHeading': 'What are cookies?',
    'legal.cookie.whatBody':
      'Cookies are small text files that are downloaded and installed on your computer or mobile device through your browser (Internet Explorer, Firefox, Chrome, Safari…). Cookies allow websites to "remember" you, either during a visit (via "session cookies") or across multiple visits (via "persistent cookies"), storing your preferences to offer a personalized, easier, and faster experience. Only the server that installed them can read their content, which is anonymous. Although they are stored on your hard drive, being only text they cannot access personal information on your computer, transmit viruses, or do anything other than track navigation on a website.',
    'legal.cookie.byDurationHeading': 'COOKIES BY DURATION',
    'legal.cookie.sessionHeading': 'SESSION COOKIES',
    'legal.cookie.sessionBody':
      'Designed to collect and store data while the user accesses a web page. They are used to store information that is only needed for a single session.',
    'legal.cookie.persistentHeading': 'PERSISTENT COOKIES',
    'legal.cookie.persistentBody':
      'A type of cookie in which data remains stored on the device and can be accessed and processed for a period defined by the cookie controller, ranging from a few minutes to several years.',
    'legal.cookie.byControllerHeading': 'COOKIES BY CONTROLLER',
    'legal.cookie.firstPartyHeading': 'FIRST-PARTY COOKIES',
    'legal.cookie.firstPartyBody': 'Cookies created by the owner of the website.',
    'legal.cookie.thirdPartyHeading': 'THIRD-PARTY COOKIES',
    'legal.cookie.thirdPartyBody':
      'Cookies created and managed by other entities, such as advertising, personalization, or analytics service providers. These third parties may report anonymous data.',
    'legal.cookie.byPurposeHeading': 'COOKIES BY PURPOSE',
    'legal.cookie.technicalHeading': 'TECHNICAL COOKIES',
    'legal.cookie.technicalBody':
      'Enable the user to navigate the website, platform or application and use its different options or services.',
    'legal.cookie.personalizationHeading': 'PERSONALIZATION COOKIES',
    'legal.cookie.personalizationBody':
      "Allow the user to access the service with predefined general characteristics based on criteria on the user's terminal, such as language, browser type, regional settings, etc.",
    'legal.cookie.analyticsHeading': 'ANALYTICS COOKIES',
    'legal.cookie.analyticsBody':
      'Allow the cookie controller to track and analyze the behavior of website users. Information collected through these cookies is used to measure website activity and create browsing profiles.',
    'legal.cookie.advertisingHeading': 'ADVERTISING COOKIES',
    'legal.cookie.advertisingBody':
      'Allow the most efficient management of advertising spaces that the publisher has included on a web page.',
    'legal.cookie.behavioralHeading': 'BEHAVIORAL ADVERTISING COOKIES',
    'legal.cookie.behavioralBody':
      'Allow management of advertising spaces by storing information about user behavior obtained through continuous observation of their browsing habits.',
    'legal.cookie.usedHeading': 'What cookies does this website use?',
    'legal.cookie.consentCookieBody': 'Stores the cookie consent response for 1 year.',
    'legal.cookie.gaBody': 'Third-party analytics cookies used by us and Google.',
    'legal.cookie.gaMore': 'More information',
    'legal.cookie.disqusBody': 'Cookies required by the Disqus comment system.',
    'legal.cookie.disqusMore': 'More information',
    'legal.cookie.revokeHeading': 'Revoking consent',
    'legal.cookie.revokeBody':
      'If you later decide to revoke your consent, configure your browser to reject cookies and clear your browsing history to remove already installed cookies.',
    'legal.cookie.disableHeading': 'Disabling cookies',
    'legal.cookie.disableIE': 'More information',
    'legal.cookie.disableFF': 'More information',
    'legal.cookie.disableChrome': 'More information',
    'legal.cookie.disableSafari': 'More information',
    'legal.cookie.updated': 'Updated: 1/12/2019',

    // About page
    'about.connectWithMe': 'Connect with me',

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
    'newsletter.stayUpdated': 'Mantente al día',
    'newsletter.digest': 'Recibe resúmenes mensuales de nuevos posts en tu bandeja de entrada',
    'newsletter.emailPlaceholder': 'tu@email.com',
    'newsletter.emailLabel': 'Correo electrónico',
    'newsletter.subscribing': 'Suscribiendo…',
    'newsletter.successMessage': '¡Éxito! Revisa tu correo para confirmar tu suscripción.',
    'newsletter.errorInvalidEmail': 'Por favor introduce una dirección de correo válida',
    'newsletter.errorGeneric': 'Algo salió mal. Por favor inténtalo de nuevo.',
    'newsletter.errorNetwork':
      'Error de red. Por favor comprueba tu conexión e inténtalo de nuevo.',
    'newsletter.maybeLater': 'Quizás más tarde',
    'newsletter.close': 'Cerrar',
    // Subscribe page
    'newsletter.subscribePage.title': 'Suscribirse al boletín',
    'newsletter.subscribePage.description': 'Recibe resúmenes mensuales de nuevos posts',
    'newsletter.subscribePage.whatYouGet': 'Qué recibirás',
    'newsletter.subscribePage.benefit1': 'Resumen mensual de nuevas entradas del blog',
    'newsletter.subscribePage.benefit2': 'Resúmenes generados por IA de cada post',
    'newsletter.subscribePage.benefit3': 'Sin spam, solo contenido de calidad sobre desarrollo web',
    'newsletter.subscribePage.benefit4': 'Date de baja en cualquier momento con un clic',
    'newsletter.subscribePage.privacy':
      'Respeto tu privacidad. Tu correo solo se usará para este boletín.',
    'newsletter.subscribePage.howToUnsubscribe': 'Cómo darse de baja',
    'newsletter.subscribePage.backToHome': 'Volver al inicio',
    'newsletter.subscribePage.confirmedTitle': '¡Suscripción confirmada!',
    'newsletter.subscribePage.confirmedBody':
      '¡Gracias por suscribirte! Recibirás resúmenes mensuales de nuevos posts.',
    'newsletter.subscribePage.errorTitle': 'Error en la suscripción',
    'newsletter.subscribePage.errorInvalid':
      'Enlace de confirmación inválido. Por favor, intenta suscribirte de nuevo.',
    'newsletter.subscribePage.errorNotFound':
      'Correo no encontrado. Por favor, suscríbete de nuevo.',
    'newsletter.subscribePage.errorInvalidToken':
      'Enlace de confirmación inválido o corrupto. Por favor, intenta suscribirte de nuevo.',
    'newsletter.subscribePage.errorExpired':
      'El enlace de confirmación ha expirado. Por favor, suscríbete de nuevo.',
    'newsletter.subscribePage.errorServer': 'Algo salió mal. Por favor inténtalo más tarde.',
    'newsletter.subscribePage.errorFallback': 'Se produjo un error. Por favor inténtalo de nuevo.',

    // Legal — Cookie Policy page
    'legal.cookiePolicy': 'Política de Cookies',
    'legal.cookie.intro':
      'Este sitio web, como muchos otros, utiliza cookies para mejorar tu experiencia como usuario. De acuerdo con la legislación aplicable, te informamos sobre qué son, cuáles utilizamos, cómo eliminarlas y te pediremos tu consentimiento para su uso.',
    'legal.cookie.infoHeading': 'INFORMACIÓN',
    'legal.cookie.whatHeading': '¿Qué son las cookies?',
    'legal.cookie.whatBody':
      'Las cookies son pequeños archivos de texto que se descargan e instalan en tu ordenador o dispositivo móvil a través de tu navegador (Internet Explorer, Firefox, Chrome, Safari…). Las cookies permiten a los sitios web "recordarte", ya sea durante una visita (mediante "cookies de sesión") o en múltiples visitas (mediante "cookies persistentes"), almacenando tus preferencias para ofrecer una experiencia personalizada, más fácil y rápida. Solo el servidor que las instaló puede leer su contenido, que es anónimo. Aunque se almacenan en tu disco duro, al ser solo texto no pueden acceder a información personal de tu ordenador, transmitir virus ni hacer nada más que rastrear la navegación en un sitio web.',
    'legal.cookie.byDurationHeading': 'COOKIES POR DURACIÓN',
    'legal.cookie.sessionHeading': 'COOKIES DE SESIÓN',
    'legal.cookie.sessionBody':
      'Diseñadas para recopilar y almacenar datos mientras el usuario accede a una página web. Se usan para almacenar información que solo es necesaria durante una única sesión.',
    'legal.cookie.persistentHeading': 'COOKIES PERSISTENTES',
    'legal.cookie.persistentBody':
      'Tipo de cookie en la que los datos permanecen almacenados en el dispositivo y pueden ser accedidos y procesados durante un período definido por el responsable de la cookie, que puede ir desde unos minutos hasta varios años.',
    'legal.cookie.byControllerHeading': 'COOKIES POR TITULAR',
    'legal.cookie.firstPartyHeading': 'COOKIES PROPIAS',
    'legal.cookie.firstPartyBody': 'Cookies creadas por el propietario del sitio web.',
    'legal.cookie.thirdPartyHeading': 'COOKIES DE TERCEROS',
    'legal.cookie.thirdPartyBody':
      'Cookies creadas y gestionadas por otras entidades, como proveedores de servicios de publicidad, personalización o analítica. Estos terceros pueden reportar datos anónimos.',
    'legal.cookie.byPurposeHeading': 'COOKIES POR FINALIDAD',
    'legal.cookie.technicalHeading': 'COOKIES TÉCNICAS',
    'legal.cookie.technicalBody':
      'Permiten al usuario navegar por el sitio web, plataforma o aplicación y utilizar sus diferentes opciones o servicios.',
    'legal.cookie.personalizationHeading': 'COOKIES DE PERSONALIZACIÓN',
    'legal.cookie.personalizationBody':
      'Permiten al usuario acceder al servicio con características generales predefinidas en función de criterios en el terminal del usuario, como el idioma, el tipo de navegador, la configuración regional, etc.',
    'legal.cookie.analyticsHeading': 'COOKIES ANALÍTICAS',
    'legal.cookie.analyticsBody':
      'Permiten al responsable de las cookies hacer seguimiento y análisis del comportamiento de los usuarios del sitio web. La información recopilada se usa para medir la actividad del sitio web y crear perfiles de navegación.',
    'legal.cookie.advertisingHeading': 'COOKIES PUBLICITARIAS',
    'legal.cookie.advertisingBody':
      'Permiten la gestión más eficiente de los espacios publicitarios que el editor ha incluido en una página web.',
    'legal.cookie.behavioralHeading': 'COOKIES DE PUBLICIDAD COMPORTAMENTAL',
    'legal.cookie.behavioralBody':
      'Permiten la gestión de los espacios publicitarios almacenando información sobre el comportamiento del usuario obtenida mediante la observación continua de sus hábitos de navegación.',
    'legal.cookie.usedHeading': '¿Qué cookies utiliza este sitio web?',
    'legal.cookie.consentCookieBody':
      'Almacena la respuesta al consentimiento de cookies durante 1 año.',
    'legal.cookie.gaBody': 'Cookies analíticas de terceros utilizadas por nosotros y Google.',
    'legal.cookie.gaMore': 'Más información',
    'legal.cookie.disqusBody': 'Cookies requeridas por el sistema de comentarios Disqus.',
    'legal.cookie.disqusMore': 'Más información',
    'legal.cookie.revokeHeading': 'Revocar el consentimiento',
    'legal.cookie.revokeBody':
      'Si posteriormente decides revocar tu consentimiento, configura tu navegador para rechazar cookies y borra el historial de navegación para eliminar las cookies ya instaladas.',
    'legal.cookie.disableHeading': 'Desactivar cookies',
    'legal.cookie.disableIE': 'Más información',
    'legal.cookie.disableFF': 'Más información',
    'legal.cookie.disableChrome': 'Más información',
    'legal.cookie.disableSafari': 'Más información',
    'legal.cookie.updated': 'Actualizado: 1/12/2019',

    // About page
    'about.connectWithMe': 'Conéctate conmigo',

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
