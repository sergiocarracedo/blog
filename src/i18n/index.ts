/**
 * i18n Module
 * Central export for all internationalization utilities
 */

// Configuration
export {
  defaultLocale,
  locales,
  languages,
  languageNames,
  dateLocales,
  isValidLocale,
  type Locale,
} from './config';

// UI Translations
export { ui, getTranslation } from './ui';

// Utility Functions
export {
  getLangFromUrl,
  getLangFromPath,
  pathHasLocale,
  removeLocaleFromPath,
  useTranslations,
  useTranslatedPath,
  getAlternateLocalePath,
  getAlternateLocaleUrls,
  getLocalizedDate,
  getIntlLocale,
  getSupportedLocales,
  getDefaultLocale,
  getLocalizedMenuItems,
  isCurrentLocale,
  getReadingTimeText,
} from './utils';
