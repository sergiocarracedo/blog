# sergiocarracedo.es

Personal blog built with **Astro 5.x** featuring optimized performance and modern web standards.

## 🚀 Quick Start

```sh
pnpm install
pnpm dev
```

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm dev`                | Starts local dev server at `localhost:4321`     |
| `pnpm build`              | Build your production site to `./dist/`         |
| `pnpm preview`            | Preview your build locally, before deploying    |
| `pnpm optimize-images`    | Optimize images in `public/i/` directory        |
| `pnpm lint`               | Run all linters (TypeScript + Markdown)         |
| `pnpm lint:ts`            | Lint TypeScript files with ESLint               |
| `pnpm lint:ts:fix`        | Fix auto-fixable TypeScript issues              |
| `pnpm lint:oxc`           | Run oxlint (fast Rust-based linter)             |
| `pnpm lint:md`            | Lint Markdown files                             |
| `pnpm lint:md:fix`        | Fix auto-fixable Markdown issues               |
| `pnpm format`             | Format all files with Prettier                  |
| `pnpm format:check`       | Check formatting without fixing                 |
| `pnpm astro ...`          | Run CLI commands like `astro add`, `astro check`|

## 🔍 Code Quality & Linting

This project uses multiple linters to maintain code quality:

### TypeScript Linting
- **ESLint** with `eslint-config-love` (Standard TypeScript style)
- Configured for strict type checking and best practices
- Auto-fixable issues can be resolved with `pnpm lint:ts:fix`

### Markdown Linting
- **markdownlint** for consistent Markdown formatting
- Custom rules for line length (100 chars) and style consistency
- Supports both `.md` and `.mdx` files

### Fast Linting (Optional)
- **oxlint** - Rust-based linter for extremely fast code analysis
- Complements ESLint with additional performance-focused checks
- Can be used for quick pre-commit checks

### IDE Integration
- VS Code settings configured for automatic linting and formatting
- Recommended extensions: ESLint, Prettier, Markdownlint
- Format on save and fix on save enabled

## 📊 Performance Optimizations

### Image Optimization
- **87% size reduction** on main images (1.24MB → 0.16MB)
- WebP format with quality optimization
- Astro's built-in image optimization enabled
- Responsive image loading with `loading="lazy"`

### Dependency Cleanup
Removed unused dependencies:
- `framer-motion` & `motion` (unused animation libraries)
- `@tailwindcss/aspect-ratio` & `@tailwindcss/forms` (unused plugins)
- `@astrojs/image` (replaced with built-in optimization)

## 🏗️ Architecture

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Check out [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Credit

This theme is based off of the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).
