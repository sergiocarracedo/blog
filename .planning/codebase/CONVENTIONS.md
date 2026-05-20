# Codebase Conventions

This document maps conventions that are already present in the repository. It is descriptive, not aspirational.

## Stack And Scope

- Main app: Astro site with MDX and some React islands/components (`package.json`, `astro.config.mjs`).
- Secondary app: Cloudflare Worker for newsletter API under `workers/newsletter-api/` with its own `package.json` and `tsconfig.json`.
- Package manager is `pnpm` (`package.json`).

## Formatting And Static Analysis

- Prettier is the canonical formatter: `semi: true`, `singleQuote: true`, `printWidth: 100`, `tabWidth: 2`, `trailingComma: es5`, `endOfLine: lf` (`.prettierrc`).
- Astro files are formatted through `prettier-plugin-astro` (`.prettierrc`).
- ESLint is the main TypeScript lint layer and extends `eslint-config-love` (`eslint.config.js`).
- Linting only targets `**/*.ts` and `**/*.tsx`; `.astro`, `.js`, and `.mjs` files are not covered by the main ESLint rule block (`eslint.config.js`).
- A large set of strict `@typescript-eslint` rules is intentionally disabled, including `no-explicit-any`, `no-floating-promises`, and the `no-unsafe-*` family (`eslint.config.js`).
- `no-console` is disabled, and console logging is used in real code (`eslint.config.js`, `src/components/ThemeToggle.astro`, `src/components/BaseHead.astro`, `src/mdx-components.ts`).
- `oxlint` exists but has an empty ruleset, so today it is more of an available tool than an enforced standard (`oxlint.json`, `package.json`).
- Markdown and MDX are linted through `markdownlint-cli` via `lint:md` (`package.json`).

## TypeScript Conventions

- The main site extends `astro/tsconfigs/strict` and keeps `strictNullChecks` enabled (`tsconfig.json`).
- Import alias `@/* -> ./src/*` is standard for app code (`tsconfig.json`, `astro.config.mjs`).
- React JSX is enabled through `jsx: react-jsx` and `jsxImportSource: react` (`tsconfig.json`).
- The worker uses a separate strict TS config tuned for Cloudflare Workers and `moduleResolution: Bundler` (`workers/newsletter-api/tsconfig.json`).
- Type declarations are usually local and inline with usage, commonly `interface Props` in Astro files and component-specific interfaces in TSX (`src/components/NewsletterForm.astro`, `src/components/blog/BlogStatsCharts.tsx`, `src/layouts/BaseLayout.astro`).

## Naming And File Organization

- Pages follow Astro file-based routing under `src/pages/`, including dynamic segments like `src/pages/[lang]/[...slug].astro` and paginated routes like `src/pages/[lang]/tags/[tag]/[page].astro`.
- The default locale rewrite is centralized in `src/pages/index.astro`, which rewrites to `/en`.
- Components are PascalCase files, mostly `.astro`, with React/TSX used for more interactive or third-party integrations (`src/components/ThemeToggle.astro`, `src/components/blog/BlogStatsCharts.tsx`).
- Subdomains of UI are grouped by folder rather than by barrel exports, e.g. `src/components/posts/parts/`, `src/components/menu/`, `src/components/gallery/`.
- Utility modules use camelCase file names with verb-oriented naming (`src/utils/getLocalizedPosts.ts`, `src/utils/getTags.ts`, `src/utils/createSlug.ts`).
- Custom markdown behavior is isolated in dedicated remark plugin directories under `src/remark-plugins/remark-directive-*/index.js`.
- Layouts live in `src/layouts/` and are named after page roles (`src/layouts/BaseLayout.astro`, `src/layouts/AboutLayout.astro`, `src/layouts/PageLayout.astro`).

## Content Model Conventions

- Content collections are defined in one place: `src/content.config.ts`.
- The blog collection uses a schema with `z.object(...)` for frontmatter validation, including `title`, `pubDate`, `tags`, `lang`, `autoTranslated`, and `originalLang` (`src/content.config.ts`).
- Blog entries are organized by year and slug folder under `src/content/blog/<year>/<slug>/index.*.mdx` (`src/content/blog/...`).
- Locale-specific blog files use `index.en.mdx`, `index.es.mdx`, and AI-translated variants use `.t` suffixes like `index.en.t.mdx` (`src/content/blog/2023/2023-09-10-bye-pulpocon/index.en.t.mdx`).
- `generateId` in `src/content.config.ts` encodes a strong convention: path-based IDs are used to avoid collisions across co-located translations.
- Skills content is file-backed JSON rather than frontmatter-based markdown (`src/content/skills/skills.json`, `src/content.config.ts`).
- MDX pages outside collections use frontmatter plus layout assignment, for example `src/pages/about.mdx`.

## I18n And Routing Patterns

- Locale configuration is centralized in `src/i18n/config.ts` with `defaultLocale = 'en'` and `locales = ['en', 'es']`.
- Localized routing logic is utility-driven rather than scattered through pages (`src/utils/getLocalizedPosts.ts`, `src/i18n/utils.ts`).
- The codebase supports both locale-prefixed routes and locale-specific content files; `getLocalizedPostUrl()` treats English as the root locale and Spanish as `/es/...` (`src/utils/getLocalizedPosts.ts`).
- Middleware is used for legacy URL migration and RSS redirects (`src/middleware.js`).

## Component And UI Conventions

- Astro components commonly define a top-of-file `Props` interface and destructure `Astro.props` immediately (`src/components/PreferredSourcesButton.astro`, `src/components/NewsletterForm.astro`).
- Styling is largely utility-class driven directly in markup, often with long Tailwind-style class strings (`src/components/posts/PostSingle.astro`, `src/components/NewsletterForm.astro`).
- The site mixes Astro templates with inline client scripts and custom elements for interaction (`src/components/NewsletterForm.astro`).
- React is used selectively where a richer client library integration makes sense, e.g. ECharts (`src/components/blog/BlogStatsCharts.tsx`).
- MDX component wiring is centralized in `src/mdx-components.ts` and passed to rendered content (`src/components/posts/PostSingle.astro`).

## Error Handling, Validation, And Logging

- Schema validation is strongest at the content boundary through Zod in `src/content.config.ts`.
- Runtime prop validation is mostly manual and local. Example: `GalleryModal` parses JSON input, clamps columns, and throws on missing images (`src/components/GalleryModal.astro`).
- Form validation is pragmatic and inline. `NewsletterForm` validates email with a regex before POSTing (`src/components/NewsletterForm.astro`).
- API-like responses are returned explicitly with `new Response(...)` and headers rather than helper abstractions (`src/pages/blog/stats.json.ts`).
- Redirect/error flow is straightforward and imperative, using `context.redirect(...)` in middleware and `throw new Error(...)` when a component cannot render safely (`src/middleware.js`, `src/components/GalleryModal.astro`).
- Logging is present in production-facing code, often with verbose debug messages (`src/components/ThemeToggle.astro`, `src/mdx-components.ts`). This is a real convention today, but also a quality caveat because there is no guard around environment or log level.

## Guardrails And Gaps

- The strongest enforced guardrails are formatting, TypeScript strictness, content-schema validation, and markdown linting (`.prettierrc`, `tsconfig.json`, `src/content.config.ts`, `package.json`).
- The repo relies heavily on convention over tooling for `.astro` and plain `.js` files because the ESLint config primarily governs TS/TSX (`eslint.config.js`).
- There is no visible shared error utility, logger abstraction, validation library for forms, or test-enforced contract around interactive components.
- Existing comments tend to explain non-obvious content-loading or routing behavior rather than restating simple code (`src/content.config.ts`, `src/utils/getLocalizedPosts.ts`). That is a good local convention to preserve.
