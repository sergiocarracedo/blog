# Stack Map

This document maps the current implementation as it exists in the repository today. It is evidence-based and intentionally avoids assuming infrastructure that is not visible in code.

## Repository Shape

The repo is primarily a static Astro site in the root package, with a second package for a Cloudflare Worker under `workers/newsletter-api/`.

Evidence paths:
- `package.json`
- `astro.config.mjs`
- `workers/newsletter-api/package.json`
- `workers/newsletter-api/wrangler.toml`

## Primary Languages

TypeScript is the dominant implementation language across the site and scripts.
Evidence: `tsconfig.json`, `src/content.config.ts`, `scripts/generate-newsletter.ts`, `scripts/translate-post.ts`, `workers/newsletter-api/src/index.ts`.

JavaScript is also present for Astro middleware and some automation scripts.
Evidence: `src/middleware.js`, `scripts/send-newsletter.js`, `scripts/optimize-images.js`, `scripts/bundle-analysis.js`.

Astro component files are a core part of the UI layer.
Evidence: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/components/NewsletterForm.astro`.

MDX and Markdown are first-class content formats for the blog and static pages.
Evidence: `src/content.config.ts`, `src/pages/about.mdx`, `src/content/blog/**/index*.mdx`.

CSS is handled via project stylesheets and Tailwind.
Evidence: `src/styles/tailwind.css`, `src/styles/prose.css`, `src/styles/fonts.css`, `tailwind.config.ts`.

## Frameworks And Rendering Model

The main site is built with Astro 5.x.
Evidence: `package.json` depends on `astro`, `README.md`, `astro.config.mjs`.

The site uses Astro static output rather than a server adapter.
Evidence: `.astro/data-store.json` shows `"output":"static"`; deploy flow uploads `dist` in `.github/workflows/deploy.yml`; no Node server adapter is configured in `astro.config.mjs`.

React is used selectively inside the Astro app.
Evidence: `@astrojs/react` in `package.json`, `react` and `react-dom` dependencies, React integration in `astro.config.mjs`, and React components such as `src/components/blog/BlogStatsCharts.tsx`.

MDX is part of the content pipeline.
Evidence: `@astrojs/mdx` in `package.json`, `mdx()` integration in `astro.config.mjs`, and content collections in `src/content.config.ts`.

## Content And Routing

The site is content-driven around an Astro content collection named `blog`, plus a JSON-backed `skills` collection.
Evidence: `src/content.config.ts`.

There is a bilingual routing model for English and Spanish using localized routes.
Evidence: `src/pages/[lang]/index.astro`, `src/pages/[lang]/[...slug].astro`, `src/pages/[lang]/rss.xml.js`, and translation-aware fields in `src/content.config.ts`.

There are custom Markdown/MDX remark directives for embeds and richer post content.
Evidence: `astro.config.mjs`, `src/remark-plugins/remark-directive-youtube.*`, `src/remark-plugins/remark-directive-spotify.*`, `src/remark-plugins/remark-directive-iframe.*`, `src/remark-plugins/remark-directive-gallery.*`.

There is Astro middleware for legacy slug redirects and RSS alias redirects.
Evidence: `src/middleware.js`.

## Build Tooling And Package Management

The root project uses `pnpm` as the declared package manager.
Evidence: `package.json` has `packageManager: pnpm@9.15.4...`; root lockfile is `pnpm-lock.yaml`.

The Worker package appears to use `npm` locally/in CI rather than pnpm.
Evidence: `workers/newsletter-api/package-lock.json`, `workers/newsletter-api/README.md` uses `npm install`, and `.github/workflows/deploy-worker.yml` runs `npm install` in that directory.
Uncertainty: this may be a convenience choice rather than a strict requirement; the repo still appears primarily pnpm-driven at the root.

Astro Vite integration is used, with Tailwind connected through the Vite plugin.
Evidence: `astro.config.mjs` imports `@tailwindcss/vite` and sets `vite.plugins: [tailwindcss()]`.

Linting and formatting use ESLint, oxlint, markdownlint, and Prettier.
Evidence: root `package.json`, `oxlint.json`, `.markdownlint.json`, `.prettierrc`.

Type checking is strict.
Evidence: `tsconfig.json` extends `astro/tsconfigs/strict`; Worker `tsconfig.json` also sets `strict: true`.

## Styling And Frontend Libraries

Tailwind CSS 4 is present, with a minimal local config and Vite integration.
Evidence: `package.json` dependencies on `tailwindcss` and `@tailwindcss/vite`, `tailwind.config.ts`, `src/styles/tailwind.css`.

Sass is available in the toolchain.
Evidence: `sass` dependency in `package.json`.

`astro-icon` is used for SVG/icon rendering.
Evidence: `astro.config.mjs`, many components importing `astro-icon/components`, such as `src/components/ThemeToggle.astro`.

`astro-pagefind` is used for on-site search.
Evidence: `astro.config.mjs`, `src/pages/index.astro`, `src/pages/[lang]/index.astro`, `src/components/posts/PostSingle.astro`, `public/_headers` includes `/pagefind/*` caching.

ECharts is used for blog statistics visualizations through React.
Evidence: `src/components/blog/BlogStatsCharts.tsx`, `package.json` dependencies `echarts` and `echarts-for-react`.

## Runtime And Execution Environments

The main site build/runtime is static hosting for Astro output.
Evidence: `.github/workflows/deploy.yml` builds with Node 20 then uploads `dist` to GitHub Pages; `public/CNAME` sets the custom domain; `public/_headers` suggests CDN/static header control.

The newsletter subscription backend runs as a Cloudflare Worker.
Evidence: `workers/newsletter-api/package.json` uses `wrangler`; `workers/newsletter-api/src/index.ts`; `workers/newsletter-api/wrangler.toml`; `.github/workflows/deploy-worker.yml` uses `cloudflare/wrangler-action@v3`.

Node.js 20 is the explicit CI runtime for both site deployment and newsletter automation.
Evidence: `.github/workflows/deploy.yml`, `.github/workflows/newsletter-send.yml`, `.github/workflows/deploy-worker.yml`.

## Deployment And Hosting Hints

The main site is deployed to GitHub Pages.
Evidence: `.github/workflows/deploy.yml` uses `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`.

The custom production domain is `sergiocarracedo.es`.
Evidence: `astro.config.mjs` `site`, `src/consts.ts` `SITE_URL`, and `public/CNAME`.

The newsletter API is deployed to `newsletter-api.sergiocarracedo.workers.dev` by default.
Evidence: `workers/newsletter-api/wrangler.toml`, `src/components/NewsletterForm.astro` default `PUBLIC_NEWSLETTER_API_URL` fallback.

There is a commented hint that the Worker could move to a custom domain later.
Evidence: commented `routes` block in `workers/newsletter-api/wrangler.toml` and `workers/newsletter-api/README.md`.

## Environment Variable Patterns

Public client-side env usage is currently visible for newsletter API endpoint selection.
Evidence: `src/components/NewsletterForm.astro` uses `import.meta.env.PUBLIC_NEWSLETTER_API_URL`.

Server/script env vars are used heavily in automation and newsletter flows.
Evidence paths:
- `.env.example`
- `scripts/generate-newsletter.ts`
- `scripts/send-newsletter.js`
- `scripts/translate-post.ts`
- `.github/workflows/deploy.yml`
- `.github/workflows/newsletter-send.yml`
- `workers/newsletter-api/src/index.ts`
- `workers/newsletter-api/wrangler.toml`

Observed env names include:
- `PUBLIC_NEWSLETTER_API_URL`
- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `SITE_URL`
- `RESEND_AUDIENCE_ID`
- `WORKER_URL`
- `ALLOWED_ORIGIN`
- `DAYS_BACK`

## Major Dependencies And What They Indicate

`astro`, `@astrojs/mdx`, `@astrojs/react`, `@astrojs/rss`, `@astrojs/sitemap`: static content site with MDX, React islands/components, RSS, and sitemap generation. Evidence: `package.json`, `astro.config.mjs`, `src/pages/rss.xml.js`.

`ai`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@google/generative-ai`: AI-assisted translation/newsletter generation scripts. Evidence: `scripts/generate-newsletter.ts`, `scripts/translate-post.ts`, `scripts/translate-all-posts.ts`.

`resend`, `@react-email/components`, `react-email`: newsletter sending and templated emails. Evidence: `scripts/send-newsletter.js`, `src/emails/MonthlyNewsletter.tsx`, `workers/newsletter-api/src/index.ts`.

`sharp`: image optimization in content and newsletter flows. Evidence: `scripts/optimize-images.js`, `scripts/optimize-blog-images.js`, `scripts/generate-newsletter.ts`.

`gray-matter`: frontmatter parsing for content scripts. Evidence: `scripts/generate-newsletter.ts`, `scripts/tag-missing-blog-tags.js`.

`@jop-software/astro-cookieconsent` and `vanilla-cookieconsent`: consent gating around analytics/disqus. Evidence: `astro.config.mjs`, `cookieConsentConfig.ts`, `src/components/PostComments.astro`.

## Notably Absent Or Weakly Evidenced

No first-party application database is evident in the main site code. The repo shows file-based content and a newsletter audience stored in Resend contacts, but no Postgres/MySQL/SQLite client library is configured for the app itself.

No queue, cron worker platform, or job runner is directly implemented in app code beyond GitHub Actions schedules.

No SSR adapter, API server framework, or serverless function setup is visible for the main Astro site.

These absences are evidence-based only for the checked repo state; hidden infrastructure outside the repo may still exist.
