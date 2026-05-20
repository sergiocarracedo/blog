# Integrations Map

This document focuses on external systems and integration points that are visible in the repository today. Each item includes concrete evidence paths and calls out uncertainty when the repo only provides hints.

## Summary

The strongest confirmed integrations are:
- Google Analytics 4
- Disqus comments
- Resend for subscriber storage and email delivery
- Google Gemini via AI SDK for translation and newsletter generation
- OpenAI and Anthropic as optional AI providers for translation scripts
- Cloudflare Workers for newsletter subscription API
- GitHub Actions and GitHub Pages for automation and hosting

## Analytics

Google Analytics 4 is directly embedded in the main site layout.
Evidence:
- `src/layouts/BaseLayout.astro` loads `https://www.googletagmanager.com/gtag/js?id=${GA}` and calls `gtag('config', 'G-87X78TXEGE')`
- `src/consts.ts` defines `GA = 'G-87X78TXEGE'`
- `cookieConsentConfig.ts` registers GA4 under the `analytics` cookie category
- `src/pages/[lang]/legal/cookie-policy.astro` references Google Analytics in legal copy

Uncertainty: no custom GA event tracking was confirmed in the files reviewed; evidence currently supports page-level embedding and consent management, not a broader analytics taxonomy.

## Comments / Community Widgets

Disqus is integrated for blog comments and is gated behind consent.
Evidence:
- `src/consts.ts` defines `DISQUS = 'sergiocarracedo.disqus.com'`
- `src/components/PostComments.astro` loads `https://${shortname}/embed.js`
- `cookieConsentConfig.ts` defines a `disqus` analytics service and cookie patterns
- `src/pages/[lang]/legal/cookie-policy.astro` links to the Disqus privacy policy

## Search

Pagefind is used for local site search.
Evidence:
- `astro.config.mjs` enables `pagefind()`
- `src/pages/index.astro`, `src/pages/[lang]/index.astro`, `src/pages/[lang]/blog/page/[page].astro`, and `src/components/posts/PostSingle.astro` import `astro-pagefind/components/Search`
- `public/_headers` configures long-lived caching for `/pagefind/*`

This is an integration with a local/generated search index rather than a hosted third-party search SaaS.

## Cookie Consent / Privacy Tooling

The site integrates `vanilla-cookieconsent` through an Astro wrapper.
Evidence:
- `astro.config.mjs` includes `cookieconsent(cookieConsentConfig)`
- `cookieConsentConfig.ts` configures categories and services
- `package.json` depends on `@jop-software/astro-cookieconsent` and `vanilla-cookieconsent`

This controls whether GA4 and Disqus are activated.

## Email Delivery And Newsletter Platform

Resend is the core newsletter/email provider.
Evidence:
- Root `package.json` depends on `resend`
- `scripts/send-newsletter.js` uses `new Resend(process.env.RESEND_API_KEY)` and `resend.batch.send(...)`
- `workers/newsletter-api/src/index.ts` uses `new Resend(env.RESEND_API_KEY)` plus `resend.contacts.create`, `resend.contacts.list`, `resend.contacts.update`, `resend.contacts.remove`, and `resend.emails.send`
- `.env.example` includes `RESEND_API_KEY` and `FROM_EMAIL`
- `workers/newsletter-api/wrangler.toml` defines `RESEND_AUDIENCE_ID`

Resend is used for two roles:
- transactional email delivery for subscription confirmation and welcome emails
- subscriber/contact storage via a Resend audience

Evidence for audience/contact usage:
- `workers/newsletter-api/src/index.ts`
- `scripts/send-newsletter.js` reads subscribers from `resend.contacts.list()` and groups them by `properties.lang`

Uncertainty: the repo does not show a separate CRM or database synced with Resend; based on current code, Resend appears to be the source of truth for newsletter subscribers.

## Email Templates

React Email is used to render newsletter templates.
Evidence:
- `package.json` depends on `@react-email/components` and `react-email`
- `src/emails/MonthlyNewsletter.tsx`
- `src/emails/WelcomeEmail.tsx`
- `scripts/send-newsletter.js` imports `render` from `@react-email/components` and renders `MonthlyNewsletter`

Important nuance: the Worker currently sends confirmation/welcome emails as inline HTML strings in `workers/newsletter-api/src/index.ts`, while the root scripts use React Email templates for the monthly digest.

## AI Providers

Google Gemini is actively used for newsletter content generation.
Evidence:
- `scripts/generate-newsletter.ts` imports `google` from `@ai-sdk/google`
- the script requires `GOOGLE_GENERATIVE_AI_API_KEY`
- it selects `google('gemini-2.0-flash')`
- `.env.example` documents `GOOGLE_GENERATIVE_AI_API_KEY`
- `.github/workflows/newsletter-send.yml` passes `GOOGLE_GENERATIVE_AI_API_KEY`

Google Gemini is also used in deploy-time translation automation.
Evidence:
- `.github/workflows/deploy.yml` sets `AI_PROVIDER: google`
- `.github/workflows/deploy.yml` passes `GOOGLE_GENERATIVE_AI_API_KEY`
- the workflow runs `pnpm translate:missing --to es` and `pnpm translate:missing --to en`

OpenAI is supported as an optional translation provider.
Evidence:
- `scripts/translate-post.ts` imports `openai` from `@ai-sdk/openai`
- it documents `OPENAI_API_KEY`
- default provider in script logic is `openai` when `AI_PROVIDER` is absent

Anthropic is supported as an optional translation provider.
Evidence:
- `scripts/translate-post.ts` imports `anthropic` from `@ai-sdk/anthropic`
- it documents `ANTHROPIC_API_KEY`

Uncertainty: only Google is clearly wired into CI today. OpenAI and Anthropic are present in code and can be selected locally, but there is no reviewed workflow showing them used in production automation.

## Hosting And Deployment Providers

GitHub Pages is the confirmed hosting target for the main Astro site.
Evidence:
- `.github/workflows/deploy.yml` uses `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`
- `public/CNAME` sets `sergiocarracedo.es`

Cloudflare Workers is the confirmed runtime for the newsletter subscription API.
Evidence:
- `workers/newsletter-api/package.json` scripts use `wrangler`
- `workers/newsletter-api/wrangler.toml`
- `.github/workflows/deploy-worker.yml` uses `cloudflare/wrangler-action@v3`

Cloudflare DNS/custom domain use is hinted but not fully enabled in checked-in config.
Evidence:
- commented `routes` stanza in `workers/newsletter-api/wrangler.toml`
- `workers/newsletter-api/README.md` documents optional custom domain setup

Uncertainty: the repo proves Worker deployment to `*.workers.dev`; it does not prove a custom Cloudflare route is active.

## Auth Providers

No user authentication provider is evident for the public site.

Newsletter subscription uses email confirmation rather than account auth.
Evidence:
- `workers/newsletter-api/src/index.ts` generates a token, stores a hashed token in contact metadata, and validates `/confirm?token=...&email=...`

This is closer to double opt-in email verification than a reusable auth system.

## Databases And Storage

No general-purpose application database is visible in the main app code.

Confirmed storage patterns are:
- file-based content in `src/content/blog/**`
- generated static output in `dist/` during deployment
- local/generated newsletter images under `public/newsletter-images/` via `scripts/generate-newsletter.ts`
- browser `localStorage` use in `src/components/PreferredSourcesButton.astro`
- Resend contacts/audience used as newsletter subscriber storage in `workers/newsletter-api/src/index.ts` and `scripts/send-newsletter.js`

No evidence was found for Postgres, MySQL, SQLite, Redis, D1, KV, R2, Supabase, Firebase, or MongoDB usage in the running app.

Uncertainty: external infrastructure outside this repo could exist, but it is not referenced in the reviewed codepaths.

## Webhooks, Queues, Workers, Scheduled Jobs

Cloudflare Worker routes exist for newsletter subscription handling.
Evidence:
- `workers/newsletter-api/src/index.ts` serves `POST /subscribe`, `GET /confirm`, and `GET /health`

GitHub Actions provides the recurring schedule for newsletter sending.
Evidence:
- `.github/workflows/newsletter-send.yml` has `cron: '0 9 1 * *'`

There is also deploy-time automation for translation.
Evidence:
- `.github/workflows/deploy.yml` translates missing posts before building and deploying

No explicit queue broker or webhook consumer was found.
The closest thing to a background job system is GitHub Actions plus the Cloudflare Worker.

## Cross-Origin / Public API Surface

The newsletter API is called from the browser and supports CORS.
Evidence:
- `src/components/NewsletterForm.astro` posts to `${apiUrl}/subscribe`
- `workers/newsletter-api/src/index.ts` builds CORS headers from `ALLOWED_ORIGIN`
- `workers/newsletter-api/wrangler.toml` sets `ALLOWED_ORIGIN = "https://sergiocarracedo.es"`

The Worker’s default public base URL is `https://newsletter-api.sergiocarracedo.workers.dev`.
Evidence:
- `workers/newsletter-api/wrangler.toml`
- `src/components/NewsletterForm.astro`

## Infrastructure Secrets And Config Surface

Visible secret/config names tied to integrations:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `RESEND_AUDIENCE_ID`
- `WORKER_URL`
- `ALLOWED_ORIGIN`
- `SITE_URL`
- `PUBLIC_NEWSLETTER_API_URL`
- `CLOUDFLARE_API_TOKEN`

Evidence paths:
- `.env.example`
- `.github/workflows/deploy.yml`
- `.github/workflows/newsletter-send.yml`
- `.github/workflows/deploy-worker.yml`
- `workers/newsletter-api/wrangler.toml`
- `scripts/translate-post.ts`
- `src/components/NewsletterForm.astro`

## Integration Gaps / Unknowns

No payment provider, ads platform, feature flag service, error reporting service, or product analytics platform beyond GA4 was confirmed.

No inbound webhook handlers were found.

No dedicated newsletter unsubscribe backend was found in the Worker. The monthly email currently points to `${siteUrl}/newsletter/unsubscribe` from `scripts/send-newsletter.js`, but the checked code reviewed here only confirms a static unsubscribe page at `src/pages/newsletter/unsubscribe.md`, not a full unsubscribe processing backend.
Uncertainty: unsubscribe may be handled by Resend-native headers or an external/manual flow, but that was not proven from the reviewed files.
