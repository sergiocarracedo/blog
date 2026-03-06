/**
 * i18n Utility Functions
 * Helper functions for internationalization
 */

import { defaultLocale, isValidLocale, dateLocales, type Locale, locales } from './config';
import { ui } from './ui';

/**
 * Extract locale from URL path
 * Returns the default locale if no valid locale prefix is found
 */
export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (isValidLocale(lang)) {
    return lang;
  }
  return defaultLocale;
}

/**
 * Extract locale from a path string
 */
export function getLangFromPath(path: string): Locale {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment;
  }
  return defaultLocale;
}

/**
 * Check if a path starts with a locale prefix
 */
export function pathHasLocale(path: string): boolean {
  const segments = path.split('/').filter(Boolean);
  return segments.length > 0 && isValidLocale(segments[0]);
}

/**
 * Remove locale prefix from path if present
 */
export function removeLocaleFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && isValidLocale(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }
  return path;
}

/**
 * Create a translation function for a specific locale
 * Supports parameter interpolation with {param} syntax
 */
export function useTranslations(lang: Locale) {
  return function t(key: string, params?: Record<string, string | number>): string {
    let text = ui[lang]?.[key] ?? ui[defaultLocale]?.[key] ?? key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }

    return text;
  };
}

/**
 * Create a path translation function for a specific locale
 * Converts paths to include locale prefix when needed
 */
export function useTranslatedPath(lang: Locale) {
  return function translatePath(path: string, targetLang: Locale = lang): string {
    // Remove any existing locale prefix
    const cleanPath = removeLocaleFromPath(path);

    // For default locale, don't add prefix
    if (targetLang === defaultLocale) {
      return cleanPath || '/';
    }

    // For other locales, add prefix
    return `/${targetLang}${cleanPath}`;
  };
}

/**
 * Get the path for the same content in a different locale
 */
export function getAlternateLocalePath(currentPath: string, targetLocale: Locale): string {
  const cleanPath = removeLocaleFromPath(currentPath);

  if (targetLocale === defaultLocale) {
    return cleanPath || '/';
  }

  return `/${targetLocale}${cleanPath}`;
}

/**
 * Generate alternate locale URLs for hreflang tags
 */
export function getAlternateLocaleUrls(
  currentPath: string,
  siteUrl: string
): Record<Locale | 'x-default', string> {
  const cleanPath = removeLocaleFromPath(currentPath);
  const baseUrl = siteUrl.replace(/\/$/, '');

  return {
    en: `${baseUrl}${cleanPath || '/'}`,
    es: `${baseUrl}/es${cleanPath}`,
    'x-default': `${baseUrl}${cleanPath || '/'}`, // Default to English
  };
}

/**
 * Format a date according to locale
 */
export function getLocalizedDate(
  date: Date,
  lang: Locale,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  return date.toLocaleDateString(dateLocales[lang], options);
}

/**
 * Get locale for Intl APIs
 */
export function getIntlLocale(lang: Locale): string {
  return dateLocales[lang];
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): readonly Locale[] {
  return locales;
}

/**
 * Get the default locale
 */
export function getDefaultLocale(): Locale {
  return defaultLocale;
}

/**
 * Create localized URLs for navigation menu items
 */
export function getLocalizedMenuItems(lang: Locale): Array<{ label: string; href: string }> {
  const t = useTranslations(lang);
  const translatePath = useTranslatedPath(lang);

  return [
    { label: t('nav.home'), href: translatePath('/') },
    { label: t('nav.blog'), href: translatePath('/blog') },
    { label: t('nav.byYear'), href: translatePath('/blog/by-year') },
    { label: t('nav.about'), href: translatePath('/about') },
  ];
}

/**
 * Check if current locale matches target locale
 */
export function isCurrentLocale(currentLang: Locale, targetLang: Locale): boolean {
  return currentLang === targetLang;
}

/**
 * Get reading time text with proper pluralization
 */
export function getReadingTimeText(minutes: number, lang: Locale): string {
  const t = useTranslations(lang);
  const key = minutes === 1 ? 'post.minuteRead' : 'post.minutesRead';
  return t(key, { count: minutes });
}
