# Architecture Map

This repository is primarily an Astro 5 static-content site with a bilingual blog, plus a separate Cloudflare Worker used for newsletter subscription flows.
The repo evidence for the main app entry is `astro.config.mjs`, which configures Astro integrations, markdown/MDX behavior, Vite aliasing, and React support.
The runtime split is important: the site itself is mostly statically generated from `src/pages/**` and `src/content/**`, while newsletter subscribe/confirm requests are handled by `workers/newsletter-api/src/index.ts`.

## Entry Points

The Astro application entry is the filesystem router rooted at `src/pages/`.
`src/pages/index.astro` rewrites `/` to `/en`, establishing English as the effective root experience.
`src/pages/[lang]/index.astro` is the localized homepage and renders the hero, latest posts, and Pagefind search.
`src/pages/[...slug].astro` serves root-language post pages.
`src/pages/[lang]/[...slug].astro` serves locale-prefixed post pages and handles translation fallback behavior.
Other notable page entry points are `src/pages/[lang]/blog/page/[page].astro`, `src/pages/[lang]/tags/[tag]/[page].astro`, `src/pages/[lang]/blog/by-year.astro`, `src/pages/[lang]/blog/stats.astro`, `src/pages/rss.xml.js`, `src/pages/[lang]/rss.xml.js`, and `src/pages/blog/stats.json.ts`.
The Astro middleware entry is `src/middleware.js`, which performs legacy URL redirects before normal handling.
The worker entry is `workers/newsletter-api/src/index.ts`, exported through `wrangler.toml` with `main = "src/index.ts"`.
The email-rendering entry for operational scripts is `src/emails/MonthlyNewsletter.tsx`.

## App Shape

The UI shell is built around `src/layouts/BaseLayout.astro`, which wraps all pages with `BaseHead`, `Header`, `Footer`, analytics scripts, and floating newsletter/preferred-source UI.
`src/components/BaseHead.astro` centralizes metadata, global stylesheet loading, RSS link tags, hreflang tags, Astro view transitions, theme bootstrapping, and a copy-code client script.
`src/components/Header.astro` and `src/components/Footer.astro` hold cross-page navigation concerns.
`src/layouts/PageLayout.astro` and `src/layouts/AboutLayout.astro` are thinner page-level wrappers layered on top of `BaseLayout.astro`.
Post detail pages are rendered through `src/components/posts/PostSingle.astro`.
List pages use `src/components/posts/PostTeaser.astro`, `src/components/Pagination.astro`, and `src/components/SectionHeader.astro`.
The only clearly React-island UI found in the main site is `src/components/blog/BlogStatsCharts.tsx`, mounted with `client:only="react"` from `src/pages/[lang]/blog/stats.astro`.

## Content And Data Flow

The authoritative content source is the Astro content collection defined in `src/content.config.ts`.
The `blog` collection loads from `src/content/blog/**` using `astro/loaders` glob loading and a custom `generateId` function.
That ID strategy is a key architectural choice because it prevents collisions between co-located locale files such as `index.es.mdx` and `index.en.mdx`.
The `skills` collection is separate and file-backed from `src/content/skills/skills.json`.
Most page data is pulled at build time via `getCollection('blog')`, then filtered or reshaped by utility functions in `src/utils/getLocalizedPosts.ts`, `src/utils/enrichBlogPost.ts`, and `src/utils/getBlogStats.ts`.
Localized routing depends on `getLocalizedPosts`, `getRoutingSlug`, `getPostTranslations`, and `getPostSwitcherUrls` in `src/utils/getLocalizedPosts.ts`.
Post rendering calls `render(post)` from `astro:content` inside `src/components/posts/PostSingle.astro`, then injects custom MDX components from `src/mdx-components.ts`.
The MDX pipeline is extended in `astro.config.mjs` with custom remark directive plugins under `src/remark-plugins/`, enabling features like YouTube, Spotify, Asciinema, galleries, iframe embeds, and code extraction.
Blog stats are derived from the same content collection in `src/utils/getBlogStats.ts`, exposed as JSON by `src/pages/blog/stats.json.ts`, and visualized by the React chart island.
RSS feeds in `src/pages/rss.xml.js` and `src/pages/[lang]/rss.xml.js` also derive from `getLocalizedPosts`.

## Rendering And Runtime Model

The dominant model is static generation through Astro `getStaticPaths()` and content collection reads.
Evidence: many routes export `getStaticPaths`, including `src/pages/[lang]/index.astro`, `src/pages/[lang]/blog/page/[page].astro`, `src/pages/[lang]/[...slug].astro`, and tag routes.
The app still has meaningful client-side behavior layered on top of static HTML.
`src/components/BaseHead.astro` enables `ClientRouter` from `astro:transitions`, so navigation can use Astro view transitions.
Several components attach browser-side scripts directly in `.astro` files, including theme initialization in `BaseHead.astro`, sticky header behavior in `Header.astro`, newsletter form submission in `NewsletterForm.astro`, and lazy hover video behavior in `PostTeaser.astro`.
Search appears to be client-side Pagefind search via `astro-pagefind/components/Search`, used on the home page, blog list, post pages, and 404 page.
The blog stats page explicitly opts into client-only React rendering for charts.
I do not see SSR adapters or a custom server adapter in `astro.config.mjs`, so the evidence supports a static-site-first deployment model. There may still be platform-side rewrites or hosting behavior outside this repo, but that is not proven here.

## Localization Model

Localization is implemented as a URL-prefix strategy with `en` as default and `es` as secondary locale, defined in `src/i18n/config.ts`.
Helpers in `src/i18n/utils.ts` derive locale from the URL, translate labels from `src/i18n/ui.ts`, and add or remove locale prefixes from paths.
English pages generally live at root paths without an `/en` prefix in public URLs, but the app frequently rewrites root pages to localized route handlers such as `/en` or `/en/blog/page/1`.
Post localization is file-based and co-located in the content tree, with files like `index.en.mdx`, `index.es.mdx`, and `index.es.t.mdx` under the same directory.
`src/pages/[lang]/[...slug].astro` also implements a fallback model where a missing non-default locale can still render the English file and mark it as fallback.
`src/components/AutoTranslatedNotice.astro` and the `autoTranslated` / `originalLang` fields in `src/content.config.ts` show that translation provenance is part of the content model.

## Shared Abstractions

The most important shared abstraction is the content utility layer in `src/utils/`.
`getLocalizedPosts.ts` is effectively the routing/content-resolution core for posts, tags, translations, and switcher URLs.
`enrichBlogPost.ts` normalizes per-post derived fields such as excerpt, reading time, URL slug, and a shared transition-safe ID.
`getBlogStats.ts` is the analytics aggregation layer for the archive.
The i18n module in `src/i18n/` is another cross-cutting abstraction used in layouts, pages, and components.
`src/consts.ts` centralizes site metadata, author information, social links, analytics IDs, and some branding constants.
`src/mdx-components.ts` and `src/remark-plugins/**` form the shared markdown extension boundary.

## Newsletter Architecture

Newsletter subscribe UX lives in the main site, but delivery and confirmation logic are split across multiple boundaries.
The browser-side form component is `src/components/NewsletterForm.astro`.
It posts to `PUBLIC_NEWSLETTER_API_URL` or falls back to `https://newsletter-api.sergiocarracedo.workers.dev`.
The API target is the Cloudflare Worker in `workers/newsletter-api/src/index.ts`.
That worker creates pending contacts in Resend, stores hashed confirmation token data in the contact `firstName` field, sends a confirmation email, confirms via `/confirm`, and exposes `/health`.
This design means subscription state is not stored in this repo's Astro app; it is externalized to Resend and worker logic.
Operational newsletter generation and bulk sending are handled by scripts, not by the worker.
`scripts/generate-newsletter.ts` scans recent posts from `src/content/blog`, picks localized source files, uses Gemini through `@ai-sdk/google` to produce summaries and teasers, and optimizes email images into `public/newsletter-images/`.
`scripts/send-newsletter.js` renders `src/emails/MonthlyNewsletter.tsx`, loads subscribers from Resend, batches sends, and writes `.newsletter.lock` files inside post directories to mark included content.
`src/pages/[lang]/newsletter/archive.astro` currently appears to be a placeholder page rather than a real archive implementation.

## Workers, Scripts, And Offline Tooling

The only explicit worker-like runtime in the repo is `workers/newsletter-api/`.
I do not see browser Web Workers or Service Workers in the main site code based on the inspected files.
The `scripts/` directory contains operational content tooling: `translate-post.ts`, `translate-all-posts.ts`, `detect-language.ts`, `tag-missing-blog-tags.js`, `optimize-blog-images.js`, `optimize-images.js`, `bundle-analysis.js`, `generate-newsletter.ts`, and `send-newsletter.js`.
These scripts suggest the repo is both the site source and the editorial operations workspace.

## Key Concern Locations

Routing and URL behavior: `src/pages/**`, `src/middleware.js`, `src/utils/getLocalizedPosts.ts`, `src/i18n/utils.ts`.
SEO, metadata, RSS, canonical/hreflang: `src/components/BaseHead.astro`, `src/pages/rss.xml.js`, `src/pages/[lang]/rss.xml.js`.
Content schema and validation: `src/content.config.ts`.
Post rendering and editorial presentation: `src/components/posts/**`, `src/layouts/**`, `src/mdx-components.ts`.
Search: `astro-pagefind` integration in `astro.config.mjs` and `Search` usage in pages/components.
Analytics: GA injection in `src/layouts/BaseLayout.astro` and blog stats aggregation in `src/utils/getBlogStats.ts`.
Styling: global CSS entry `src/styles/tailwind.css`, Tailwind config in `tailwind.config.ts`, and component-local utility classes.
Newsletter subscribe flow: `src/components/NewsletterForm.astro`, `src/pages/[lang]/newsletter/subscribe.astro`, `workers/newsletter-api/src/index.ts`.
Newsletter generation and sending: `scripts/generate-newsletter.ts`, `scripts/send-newsletter.js`, `src/emails/MonthlyNewsletter.tsx`.

## Uncertainties

The deployment target for the Astro site itself is not explicit in the inspected files. `public/CNAME` suggests a static host or CDN-backed custom domain, but the exact hosting provider is not proven here.
`src/pages/[lang]/newsletter/archive.astro` references an archive concept, but the code currently says "Coming Soon", so there is no verified persisted archive subsystem.
`src/components/menu/menu.json` exists, but runtime navigation seems to be generated by i18n helpers in `src/i18n/utils.ts`; the JSON file may be legacy or secondary. I cannot confirm which source is canonical without more evidence.
No `src/lib/` directory was present in the inspected tree, so shared domain logic appears to live in `src/utils/` and `src/i18n/` instead.
