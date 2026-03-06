/**
 * i18n Configuration
 * Central configuration for internationalization settings
 */

export const defaultLocale = 'en' as const;
export const locales = ['en', 'es'] as const;

export type Locale = (typeof locales)[number];

/**
 * Display names for each language in their own language
 */
export const languages: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

/**
 * Language names in each locale
 * Used for "This post was translated from {language}" messages
 */
export const languageNames: Record<Locale, Record<Locale, string>> = {
  en: {
    en: 'English',
    es: 'Spanish',
  },
  es: {
    en: 'inglés',
    es: 'español',
  },
};

/**
 * Date locale codes for Intl.DateTimeFormat
 */
export const dateLocales: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
};

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
