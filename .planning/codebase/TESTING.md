# Testing And Quality Checks

This document describes the quality and testing setup that currently exists in the repository, based on direct repo evidence.

## Current State Summary

- There is no dedicated automated unit-test, integration-test, or E2E-test framework configured at the top level.
- A repository-wide search found no `*.test.*` or `*.spec.*` files under the app source tree.
- There is no `vitest.config.*`, `jest.config.*`, or `playwright.config.*` file in the root project.
- Quality is currently enforced mostly through linting, formatting, TypeScript strictness, content schemas, and successful Astro build/dev execution.

## Evidence For Test Framework Presence Or Absence

- Top-level `package.json` contains no `test` script and no test runner dependencies such as Vitest, Jest, Playwright, Cypress, or Testing Library.
- The root scripts are limited to app lifecycle, formatting, linting, image optimization, newsletter test sending, and translation tooling (`package.json`).
- `workers/newsletter-api/package.json` also has no `test` script; it only exposes `dev`, `deploy`, and `tail`.
- Repo search for `**/*.{test,spec}.{js,jsx,ts,tsx}` returned no matches.
- Repo search for common test config files found none at the root.

## What Acts As Quality Gates Today

- `pnpm run lint` runs `lint:ts` and `lint:md` (`package.json`).
- `pnpm run lint:ts` runs `eslint .` across the repository (`package.json`). In practice, the active ESLint rule block only applies to `**/*.ts` and `**/*.tsx` (`eslint.config.js`).
- `pnpm run lint:md` checks all Markdown and MDX files with `markdownlint` (`package.json`).
- `pnpm run format:check` validates repository formatting with Prettier (`package.json`, `.prettierrc`).
- `pnpm run format` rewrites formatting with Prettier (`package.json`).
- TypeScript strictness is part of the guardrail story because the app extends `astro/tsconfigs/strict` and the worker uses `strict: true` (`tsconfig.json`, `workers/newsletter-api/tsconfig.json`).
- Astro content schema validation catches invalid frontmatter for content collections at build/content load time (`src/content.config.ts`).

## Validation Commands To Run

Run these from the repository root unless noted otherwise.

- Install dependencies: `pnpm install`
- Run local dev server: `pnpm run dev`
- Build the site: `pnpm run build`
- Preview the production build: `pnpm run preview`
- Run primary lint suite: `pnpm run lint`
- Run TypeScript-focused linting only: `pnpm run lint:ts`
- Run TypeScript lint autofix: `pnpm run lint:ts:fix`
- Run oxlint separately: `pnpm run lint:oxc`
- Run Markdown/MDX linting only: `pnpm run lint:md`
- Autofix Markdown/MDX linting issues: `pnpm run lint:md:fix`
- Check formatting without rewriting files: `pnpm run format:check`
- Rewrite formatting: `pnpm run format`
- Exercise newsletter test-send script: `pnpm run newsletter:test`

For the worker subproject:

- Start worker locally: `pnpm run dev` from `workers/newsletter-api/`
- Deploy worker: `pnpm run deploy` from `workers/newsletter-api/`
- Tail worker logs: `pnpm run tail` from `workers/newsletter-api/`

## Practical Testing That Exists In Lieu Of A Test Suite

- Content-model correctness is partially tested by the collection schema in `src/content.config.ts`; invalid frontmatter fields or types should fail content processing.
- Routing and localization logic are encoded in utilities such as `src/utils/getLocalizedPosts.ts`, but there are no automated tests around those rules.
- Interactive behavior is mostly implemented in inline scripts or custom elements, such as `src/components/NewsletterForm.astro` and `src/components/GalleryModal.astro`, with no companion spec files.
- React client logic exists in places like `src/components/blog/BlogStatsCharts.tsx`, but there are no component tests or browser tests for rendering, dark mode behavior, or chart options.
- Middleware redirects in `src/middleware.js` are behaviorally important but currently untested.

## Important Gaps

- No `test` script means there is no single command that verifies behavior beyond lint/build quality.
- No unit tests exist for core URL/i18n logic in `src/utils/getLocalizedPosts.ts`, which contains complex routing and fallback behavior.
- No tests exist for content ID generation and translation collision avoidance in `src/content.config.ts`, even though comments show this logic is critical.
- No API or contract tests exist for `src/pages/blog/stats.json.ts` or the newsletter flow.
- No browser-level tests exist for custom elements and inline scripts in Astro components.
- No worker tests exist under `workers/newsletter-api/`, despite that package having separate runtime concerns.
- ESLint does not appear to actively lint `.astro` or most plain `.js` files under the current config, so some runtime-heavy files avoid the strongest static checks (`eslint.config.js`).

## Useful Repo-Specific Notes For Future Learnship Work

- If a future testing setup is added, the highest-value early targets are `src/utils/getLocalizedPosts.ts`, `src/content.config.ts`, `src/middleware.js`, and `src/components/NewsletterForm.astro`.
- Until then, the safest validation sequence is: `pnpm run format:check`, `pnpm run lint`, and `pnpm run build`.
- Treat successful content loading as a meaningful quality signal because so much site behavior depends on MDX content and collection schemas.
- Treat console-heavy interactive components as manual QA candidates because current tooling will not reliably catch browser-runtime regressions there (`src/components/ThemeToggle.astro`, `src/components/GalleryModal.astro`).
