# Structure Map

This document maps the current repository layout and the naming/location conventions that are visible from the codebase.
The repo is organized around an Astro site at the root, with a secondary Cloudflare Worker under `workers/newsletter-api/`.

## Root-Level Layout

`package.json`: primary app package, Astro scripts, lint/format commands, translation scripts, newsletter scripts.
`astro.config.mjs`: Astro integration hub, markdown/MDX pipeline, Vite alias `@ -> /src`, React integration, Pagefind, sitemap, cookie consent.
`tailwind.config.ts`: minimal Tailwind config with dark mode by class.
`tsconfig.json`: strict Astro TypeScript config plus `@/*` path alias.
`cookieConsentConfig.ts`: cookie consent configuration consumed by Astro integration in `astro.config.mjs`.
`public/`: static assets copied as-is, including favicons, fonts, profile/OG images, preferred source badges, and generated newsletter images.
`scripts/`: editorial and operational scripts, mostly Node/TSX entry points.
`src/`: Astro app source.
`workers/newsletter-api/`: separate worker package for newsletter subscribe/confirm endpoints.

## `src/` Top-Level Conventions

`src/pages/`: filesystem routes and endpoint handlers.
`src/components/`: reusable view pieces, mostly `.astro`, with a few `.tsx` islands.
`src/layouts/`: shell layouts layered over the global base layout.
`src/content/`: source content and content-adjacent instructions/data.
`src/utils/`: shared data-derivation and routing helpers.
`src/i18n/`: locale config, UI strings, and translation/path helpers.
`src/remark-plugins/`: custom markdown directive plugins used by Astro markdown/MDX.
`src/styles/`: global stylesheets and font declarations.
`src/emails/`: React Email templates.
`src/scripts/` does not exist; repo-level `scripts/` is used instead.
`src/lib/` also does not exist in the inspected tree.

## `src/pages/` Routing Layout

Root wrappers and rewrites live directly under `src/pages/`.
Examples: `src/pages/index.astro`, `src/pages/blog/index.astro`, `src/pages/blog/page/[page].astro`, `src/pages/newsletter/archive/index.astro`, `src/pages/newsletter/subscribe.astro`, and `src/pages/blog/stats.astro`.
These root files frequently rewrite to locale-aware pages, especially English paths.

Localized page implementations live under `src/pages/[lang]/`.
Examples: `src/pages/[lang]/index.astro`, `src/pages/[lang]/blog/page/[page].astro`, `src/pages/[lang]/blog/by-year.astro`, `src/pages/[lang]/blog/stats.astro`, `src/pages/[lang]/newsletter/subscribe.astro`, and `src/pages/[lang]/legal/cookie-policy.astro`.

Post detail routing is catch-all based.
`src/pages/[...slug].astro`: root-language post detail pages.
`src/pages/[lang]/[...slug].astro`: locale-prefixed post detail pages.

Tag routes are nested by slug and optional page number.
Examples: `src/pages/tags/[tag].astro`, `src/pages/tags/[tag]/[page].astro`, `src/pages/[lang]/tags/[tag].astro`, `src/pages/[lang]/tags/[tag]/[page].astro`.

Feed and API-like endpoints sit alongside page files.
Examples: `src/pages/rss.xml.js`, `src/pages/[lang]/rss.xml.js`, `src/pages/blog/stats.json.ts`.

Content pages can also be authored directly in Markdown/MDX under `src/pages/`.
Examples: `src/pages/about.mdx`, `src/pages/about.es.mdx`, `src/pages/newsletter/unsubscribe.md`.

## `src/content/` Conventions

Blog content lives under `src/content/blog/<year>/<post-directory>/`.
Examples from the tree include `src/content/blog/2026/2026-04-26-ai-context-in-deep/` and older folders like `src/content/blog/2012/cuentas-tuteladas-para-menores-en-las-redes-sociales/`.
This year-folder convention is strong and repeated across the archive.

Within a post directory, content files are co-located with assets.
Typical filenames are `index.en.mdx`, `index.es.mdx`, and `index.<lang>.t.mdx` for translated variants.
Legacy `index.mdx` files also exist and are still handled by utilities in `src/utils/getLocalizedPosts.ts` and `src/content.config.ts`.
Media files such as `.jpg`, `.png`, `.webm`, and `.gif` live in the same post directory as the content entry.

`src/content.config.ts` defines collection schemas and loading behavior for this whole area.
`src/content/skills/skills.json` is a non-blog content collection loaded as a file-backed collection.
`src/content/I18N_INSTRUCTIONS.md`, `src/content/using-mdx.mdx`, and `src/content/markdown-style-guide.mdx` look like editorial/process material rather than routed pages.

## `src/components/` Conventions

Generic site-shell components sit directly under `src/components/`.
Examples: `BaseHead.astro`, `Header.astro`, `Footer.astro`, `LanguageSwitcher.astro`, `ThemeToggle.astro`, `NewsletterForm.astro`, `NewsletterToast.astro`, and `GalleryModal.astro`.

Domain-specific components are grouped into subdirectories.
`src/components/posts/`: post rendering and composition.
`src/components/posts/parts/`: smaller post-only pieces such as metadata, tags, reading time, media, and navigation.
`src/components/home/`: homepage-specific UI such as `Hero.astro`.
`src/components/menu/`: navigation overlay/menu pieces and `menu.json`.
`src/components/about/`: about-page-specific section(s).
`src/components/blog/`: blog analytics island(s), currently `BlogStatsCharts.tsx`.
`src/components/gallery/`: gallery controls.

File naming is mostly PascalCase for components, even for `.astro` files.
Subdirectories use lowercase nouns like `posts`, `parts`, `home`, `about`, `menu`, `gallery`, and `blog`.
React components use `.tsx`, Astro components use `.astro`.

## `src/layouts/` Conventions

`BaseLayout.astro` is the real global shell.
`PageLayout.astro` is a generic markdown page wrapper.
`AboutLayout.astro` is a specialized layout that injects the about profile block before page content.
Layout naming is straightforward PascalCase with `Layout` suffix.

## `src/utils/` Conventions

This directory holds plain utility modules rather than framework-specific components.
Naming is function-oriented and mostly `getX.ts`, `createX.ts`, or descriptive verb phrases.
Examples: `getLocalizedPosts.ts`, `getBlogStats.ts`, `getPostsByTag.ts`, `getSortedCollection.ts`, `getSlug.ts`, `createSlug.ts`, `excerpt.ts`, and `truncate.ts`.
The notable convention is that routing-aware content logic lives here, not under pages.
`getLocalizedPosts.ts` is especially central and acts like a mini content-routing service.

## `src/i18n/` Conventions

`config.ts`: locale constants and language metadata.
`utils.ts`: locale/path/date/helper functions.
`ui.ts`: translated UI string dictionary.
`index.ts`: barrel exports.
The module is imported widely through the alias path `@/i18n`.
Locale names are short codes (`en`, `es`), and the default locale is handled as prefixless public URLs.

## `src/remark-plugins/` Conventions

Each custom directive plugin lives in its own directory under `src/remark-plugins/`.
Naming follows `remark-directive-<feature>`.
Examples: `remark-directive-youtube`, `remark-directive-spotify`, `remark-directive-gallery`, `remark-directive-iframe`, `remark-directive-code-from`, and `remark-directive-astro-entry-ref`.
Most plugin directories contain `index.js`, and several also include a local `README.md`.
These plugins are wired from `astro.config.mjs`, making them part of the site authoring contract.

## `src/styles/` Conventions

Global stylesheet entry: `src/styles/tailwind.css`.
Supporting global styles: `src/styles/prose.css` and `src/styles/fonts.css`.
These are imported from the head layer rather than per-page.
Styling in components is still heavily utility-class based.

## `scripts/` Conventions

This directory mixes TypeScript and JavaScript CLI scripts.
Content/editorial automation: `translate-post.ts`, `translate-all-posts.ts`, `detect-language.ts`, `tag-missing-blog-tags.js`.
Asset operations: `optimize-blog-images.js`, `optimize-images.js`, `bundle-analysis.js`.
Newsletter operations: `generate-newsletter.ts`, `send-newsletter.js`.
Naming is task-oriented and imperative.
These scripts act on the repository content directly, which means the repo doubles as an editorial workspace.

## `public/` Conventions

Brand assets and SEO assets live here: favicons, manifest icons, browser config, OG images, and profile images.
Fonts are under `public/fonts/` and explicitly preloaded in `src/components/BaseHead.astro`.
Generated newsletter email images are stored under `public/newsletter-images/<year>/<post-directory>/cover.jpg`.
This generated subtree is referenced by newsletter generation scripts rather than by authors manually.

## `workers/newsletter-api/` Conventions

This is a separate deployable worker package, not just another `src/` folder.
`wrangler.toml` is its deploy config.
`src/index.ts` is the worker entry point.
There is a local `package-lock.json`, which suggests this subproject may be managed independently from the root `pnpm` workspace.
The worker currently appears focused only on newsletter subscribe/confirm/health routes.

## Naming And Placement Patterns

Astro route files follow filesystem routing conventions with `[param]` and `[...slug]` segments.
Localized routes are duplicated under `[lang]/` rather than abstracted into a single locale middleware-only approach.
English root rewrites are common, so root path files often delegate rather than render directly.
Content directories use publication year first, then slug-like post folder names.
Locale-specific post files are co-located inside the same post folder instead of being separated by language folders.
View components use PascalCase filenames; utility and config modules use lowercase camel-case or hyphenless descriptive filenames.

## Uncertainties

`src/components/menu/menu.json` exists, but the active menu generation path appears to come from `getLocalizedMenuItems()` in `src/i18n/utils.ts`. The JSON file may be vestigial or used indirectly; the inspected files do not prove which is canonical.
The lack of a root workspace definition beyond `package.json` means I cannot fully confirm whether `workers/newsletter-api/` is intentionally independent or just historically separate.
No explicit test directories were found in the inspected paths, so either tests are absent or live in less obvious locations not surfaced by this mapping pass.
