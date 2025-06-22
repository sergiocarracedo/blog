import type { CookieConsentConfig } from 'vanilla-cookieconsent';

const cookiesPage = '/legal/cookie-policy';

/**
 * Configuration for the cookie consent plugin.
 * This configuration defines the GUI options, categories of cookies,
 * and translations for the consent and preferences modals.
 */
export const cookieConsentConfig: CookieConsentConfig = {
  guiOptions: {
    consentModal: {
      layout: 'box inline',
      position: 'bottom left',
    },
    preferencesModal: {
      layout: 'box',
      position: 'right',
      equalWeightButtons: true,
      flipButtons: false,
    },
  },
  categories: {
    necessary: {
      readOnly: true,
    },
    functionality: {},
    analytics: {
      services: {
        ga4: {
          label:
            '<a href="https://marketingplatform.google.com/about/analytics/terms/us/" target="_blank">Google Analytics 4</a>',

          cookies: [
            {
              name: /^_ga/,
            },
          ],
        },
        disqus: {
          label: '<a href="https://disqus.com/terms-and-policies/" target="_blank">Disqus</a>',
          cookies: [{ name: /^disqus/ }, { name: /^__jid/ }, { name: /^G_ENABLED_IDPS/ }],
        },
      },
    },
  },
  language: {
    default: 'en',
    autoDetect: 'browser',
    translations: {
      en: {
        consentModal: {
          title: 'Hello! We use cookies',
          description:
            'This site uses first-party and third-party cookies to improve the user experience and related purposes.',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          showPreferencesBtn: 'Manage preferences',
          footer: `<a href="${cookiesPage}">About cookies</a>`,
        },
        preferencesModal: {
          title: 'Consent Preferences Center',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          savePreferencesBtn: 'Save preferences',
          closeIconLabel: 'Close modal',
          serviceCounterLabel: 'Service|Services',
          sections: [
            {
              title: 'Cookie Usage',
              description:
                'We use cookies to ensure that we give you the best experience on our website. If you continue to use this site we will assume that you are happy with it.',
            },
            {
              title: 'Strictly Necessary Cookies <span class="pm__badge">Always Enabled</span>',
              description:
                'These cookies are essential for the website to function properly and cannot be disabled.',
              linkedCategory: 'necessary',
            },
            {
              title: 'Functionality Cookies',
              description:
                'These cookies allow the website to remember choices you make and provide enhanced, more personal features.',
              linkedCategory: 'functionality',
            },
            {
              title: 'Analytics Cookies',
              description:
                'These cookies help us understand how visitors interact with our website, allowing us to improve the user experience.',
              linkedCategory: 'analytics',
            },
            {
              title: 'More information',
              description: `For any query in relation to my policy on cookies and your choices, please <a class="cc__link" href="${cookiesPage}">contact me</a>.`,
            },
          ],
        },
      },
      es: {
        consentModal: {
          title: '¡Hola! Usamos cookies',
          description:
            'Este sitio utiliza cookies propias y de terceros para mejorar la experiencia del usuario y otros fines relacionados.',
          acceptAllBtn: 'Aceptar todas',
          acceptNecessaryBtn: 'Rechazar todas',
          showPreferencesBtn: 'Gestionar preferencias',
          footer: `<a href="${cookiesPage}">Sobre las cookies</a>`,
        },
        preferencesModal: {
          title: 'Centro de Preferencias de Consentimiento',
          acceptAllBtn: 'Aceptar todas',
          acceptNecessaryBtn: 'Rechazar todas',
          savePreferencesBtn: 'Guardar preferencias',
          closeIconLabel: 'Cerrar modal',
          serviceCounterLabel: 'Servicio|Servicios',
          sections: [
            {
              title: 'Uso de Cookies',
              description:
                'Utilizamos cookies para asegurarnos de brindarte la mejor experiencia en nuestro sitio web. Si continúas usando este sitio, asumiremos que estás de acuerdo.',
            },
            {
              title:
                'Cookies estrictamente necesarias <span class="pm__badge">Siempre activas</span>',
              description:
                'Estas cookies son esenciales para el funcionamiento correcto del sitio web y no se pueden desactivar.',
              linkedCategory: 'necessary',
            },
            {
              title: 'Cookies de funcionalidad',
              description:
                'Estas cookies permiten que el sitio web recuerde las elecciones que realizas y ofrezca funciones mejoradas y más personalizadas.',
              linkedCategory: 'functionality',
            },
            {
              title: 'Cookies de análisis',
              description:
                'Estas cookies nos ayudan a comprender cómo los visitantes interactúan con nuestro sitio web, lo que nos permite mejorar la experiencia del usuario.',
              linkedCategory: 'analytics',
            },
            {
              title: 'Más información',
              description: `Para cualquier consulta relacionada con nuestra política de cookies y tus opciones, por favor <a class="cc__link" href="${cookiesPage}">contáctame</a>.`,
            },
          ],
        },
      },
    },
  },
};
