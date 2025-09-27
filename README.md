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
| `pnpm astro ...`          | Run CLI commands like `astro add`, `astro check`|

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
