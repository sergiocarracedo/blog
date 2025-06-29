import type { CookieConsentConfig } from 'vanilla-cookieconsent';

const cookiesPage = '/legal/cookie-policy';

const CAT_NECESSARY = 'necessary';
const CAT_ANALYTICS = 'analytics';
const CAT_ADVERTISEMENT = 'advertisement';
const CAT_FUNCTIONALITY = 'functionality';
const CAT_SECURITY = 'security';

const SERVICE_AD_STORAGE = 'ad_storage';
const SERVICE_AD_USER_DATA = 'ad_user_data';
const SERVICE_AD_PERSONALIZATION = 'ad_personalization';
const SERVICE_ANALYTICS_STORAGE = 'analytics_storage';
const SERVICE_FUNCTIONALITY_STORAGE = 'functionality_storage';
const SERVICE_PERSONALIZATION_STORAGE = 'personalization_storage';
const SERVICE_SECURITY_STORAGE = 'security_storage';

// Define dataLayer and the gtag function.
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}

// Set default consent to 'denied' (this should happen before changing any other dataLayer)
gtag('consent', 'default', {
  [SERVICE_AD_STORAGE]: 'denied',
  [SERVICE_AD_USER_DATA]: 'denied',
  [SERVICE_AD_PERSONALIZATION]: 'denied',
  [SERVICE_ANALYTICS_STORAGE]: 'denied',
  [SERVICE_FUNCTIONALITY_STORAGE]: 'denied',
  [SERVICE_PERSONALIZATION_STORAGE]: 'denied',
  [SERVICE_SECURITY_STORAGE]: 'denied',
});

/**
 * Update gtag consent according to the users choices made in CookieConsent UI
 */
function updateGtagConsent() {
  gtag('consent', 'update', {
    [SERVICE_ANALYTICS_STORAGE]: CookieConsent.acceptedService(
      SERVICE_ANALYTICS_STORAGE,
      CAT_ANALYTICS
    )
      ? 'granted'
      : 'denied',
    [SERVICE_AD_STORAGE]: CookieConsent.acceptedService(SERVICE_AD_STORAGE, CAT_ADVERTISEMENT)
      ? 'granted'
      : 'denied',
    [SERVICE_AD_USER_DATA]: CookieConsent.acceptedService(SERVICE_AD_USER_DATA, CAT_ADVERTISEMENT)
      ? 'granted'
      : 'denied',
    [SERVICE_AD_PERSONALIZATION]: CookieConsent.acceptedService(
      SERVICE_AD_PERSONALIZATION,
      CAT_ADVERTISEMENT
    )
      ? 'granted'
      : 'denied',
    [SERVICE_FUNCTIONALITY_STORAGE]: CookieConsent.acceptedService(
      SERVICE_FUNCTIONALITY_STORAGE,
      CAT_FUNCTIONALITY
    )
      ? 'granted'
      : 'denied',
    [SERVICE_PERSONALIZATION_STORAGE]: CookieConsent.acceptedService(
      SERVICE_PERSONALIZATION_STORAGE,
      CAT_FUNCTIONALITY
    )
      ? 'granted'
      : 'denied',
    [SERVICE_SECURITY_STORAGE]: CookieConsent.acceptedService(
      SERVICE_SECURITY_STORAGE,
      CAT_SECURITY
    )
      ? 'granted'
      : 'denied',
  });
}

/**
 * Configuration for the cookie consent plugin.
 * This configuration defines the GUI options, categories of cookies,
 * and translations for the consent and preferences modals.
 */
export const cookieConsentConfig: CookieConsentConfig = {
  onFirstConsent: () => {
    updateGtagConsent();
  },
  onConsent: () => {
    updateGtagConsent();
  },
  onChange: () => {
    updateGtagConsent();
  },
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
    [CAT_NECESSARY]: {
      enabled: true, // this category is enabled by default
      readOnly: true, // this category cannot be disabled
    },
    [CAT_ANALYTICS]: {
      autoClear: {
        cookies: [
          {
            name: /^_ga/, // regex: match all cookies starting with '_ga'
          },
          {
            name: '_gid', // string: exact cookie name
          },
        ],
      },
      // See: https://cookieconsent.orestbida.com/reference/configuration-reference.html#category-services
      services: {
        [SERVICE_ANALYTICS_STORAGE]: {
          label: 'Enables storage (such as cookies) related to analytics e.g. visit duration.',
        },
        disqus: {
          label: '<a href="https://disqus.com/terms-and-policies/" target="_blank">Disqus</a>',
          cookies: [{ name: /^disqus/ }, { name: /^__jid/ }, { name: /^G_ENABLED_IDPS/ }],
        },
      },
    },
    [CAT_ADVERTISEMENT]: {
      services: {
        [SERVICE_AD_STORAGE]: {
          label: 'Enables storage (such as cookies) related to advertising.',
        },
        [SERVICE_AD_USER_DATA]: {
          label: 'Sets consent for sending user data related to advertising to Google.',
        },
        [SERVICE_AD_PERSONALIZATION]: {
          label: 'Sets consent for personalized advertising.',
        },
      },
    },
    [CAT_FUNCTIONALITY]: {
      services: {
        [SERVICE_FUNCTIONALITY_STORAGE]: {
          label:
            'Enables storage that supports the functionality of the website or app e.g. language settings.',
        },
        [SERVICE_PERSONALIZATION_STORAGE]: {
          label: 'Enables storage related to personalization e.g. video recommendations.',
        },
      },
    },
    [CAT_SECURITY]: {
      services: {
        [SERVICE_SECURITY_STORAGE]: {
          label:
            'Enables storage related to security such as authentication functionality, fraud prevention, and other user protection.',
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
              linkedCategory: CAT_NECESSARY,
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
              linkedCategory: CAT_ANALYTICS,
              cookieTable: {
                headers: {
                  name: 'Name',
                  domain: 'Service',
                  description: 'Description',
                  expiration: 'Expiration',
                },
                body: [
                  {
                    name: '_ga',
                    domain: 'Google Analytics',
                    description:
                      'Cookie set by <a href="https://business.safety.google/adscookies/">Google Analytics</a>',
                    expiration: 'Expires after 12 days',
                  },
                  {
                    name: '_gid',
                    domain: 'Google Analytics',
                    description:
                      'Cookie set by <a href="https://business.safety.google/adscookies/">Google Analytics</a>',
                    expiration: 'Session',
                  },
                ],
              },
            },
            {
              title: 'Advertising',
              description:
                'Google uses cookies for advertising, including serving and rendering ads, personalizing ads (depending on your ad settings at <a href=\"https://g.co/adsettings\">g.co/adsettings</a>), limiting the number of times an ad is shown to a user, muting ads you have chosen to stop seeing, and measuring the effectiveness of ads.',
              linkedCategory: CAT_ADVERTISEMENT,
            },
            {
              title: 'Functionality',
              description:
                'Cookies used for functionality allow users to interact with a service or site to access features that are fundamental to that service. Things considered fundamental to the service include preferences like the user’s choice of language, product optimizations that help maintain and improve a service, and maintaining information relating to a user’s session, such as the content of a shopping cart.',
              linkedCategory: CAT_FUNCTIONALITY,
            },
            {
              title: 'Security',
              description:
                'Cookies used for security authenticate users, prevent fraud, and protect users as they interact with a service.',
              linkedCategory: CAT_SECURITY,
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
