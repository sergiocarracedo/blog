# i18n Architecture & Instructions

This document explains the internationalization (i18n) architecture of this blog, the file naming conventions, and how to run auto-translations.

---

## Architecture overview

The blog is bilingual: **English (default)** and **Spanish**.

- English posts are served at `/{slug}` (no prefix).
- Spanish posts are served at `/es/{slug}`.
- If a Spanish version of a post does not exist, the English version is served at `/es/{slug}` as a fallback (with a canonical pointing to the EN URL).

The **filename** — not the `lang:` frontmatter field — is the sole source of truth for a post's locale.

---

## File naming convention

Every post lives in its own directory under `src/content/blog/`. Inside that directory the content file must follow this naming scheme:

| Filename         | Meaning                                         |
| ---------------- | ----------------------------------------------- |
| `index.en.mdx`   | English original                                |
| `index.es.mdx`   | Spanish original                                |
| `index.en.t.mdx` | English auto-translation of a Spanish original  |
| `index.es.t.mdx` | Spanish auto-translation of an English original |

The `.t` suffix marks a file that was produced by the translation script (AI-generated). These files also carry `autoTranslated: true` and `originalLang: <lang>` in their frontmatter.

**Do not** add a `lang:` frontmatter field — it is ignored. The locale is always read from the filename.

### Example directory

```
src/content/blog/2024/my-post/
├── index.en.mdx        ← EN original
├── index.es.t.mdx      ← ES auto-translation (generated)
└── cover.jpg
```

```
src/content/blog/2019/mi-post-en-espanol/
├── index.es.mdx        ← ES original
├── index.en.t.mdx      ← EN auto-translation (generated)
└── cover.jpg
```

---

## Frontmatter

All locale files share the same set of frontmatter fields. The `slug` field is the URL path segment and should match across locale variants of the same post.

```yaml
---
title: 'My post title'
pubDate: 2024-01-01
slug: my-post-slug # URL path: /my-post-slug (EN) or /es/my-post-slug (ES)
excerpt: 'Short summary' # Used in listing pages and meta description
heroImage: ./cover.jpg
tags:
  - frontend
autoTranslated: true # only on .t files
originalLang: en # only on .t files
---
```

> **Quoting rule:** always single-quote `title`, `excerpt`, and `description` values that contain colons (`:`), asterisks (`*`), exclamation marks (`!!`), or double quotes (`"`). Unquoted YAML values with these characters cause build errors.

---

## Cross-post links (`:astro-ref` directive)

To link to another post from within content, use the `:astro-ref` text directive:

```mdx
:astro-ref[link text]{path="blog/2024/my-post"}
```

The plugin resolves the path relative to `src/content/` and picks the file matching **the current post's locale** automatically. It generates a locale-prefixed URL (`/es/…` for Spanish files, `/…` for English).

To force a specific locale for the link target, use the `lang` attribute:

```mdx
:astro-ref[Read in Spanish]{path="blog/2024/my-post" lang="es"}
```

The `path` value should be the directory relative to `src/content/` — no leading slash, no trailing slash, no file extension.

---

## Running auto-translations

Set the API key for your chosen AI provider in the environment:

```bash
# Choose one:
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_GENERATIVE_AI_API_KEY=...

# Select provider (default: openai)
export AI_PROVIDER=anthropic
```

### Translate a single post

```bash
pnpm translate --file src/content/blog/2024/my-post/index.en.mdx --to es
```

This creates `src/content/blog/2024/my-post/index.es.t.mdx`.

For a dry run (prints output without writing the file):

```bash
pnpm translate --file src/content/blog/2024/my-post/index.en.mdx --to es --dry-run
```

### Translate all posts missing a translation

```bash
# Translate all EN posts that have no ES version
pnpm translate:all --to es

# Translate all ES posts that have no EN version
pnpm translate:all --to en

# Limit to 5 posts (useful for testing or rate-limiting)
pnpm translate:all --to es --limit 5

# Dry run
pnpm translate:all --to es --dry-run
```

The script skips posts that already have a translation (either `.{lang}.mdx` original or `.{lang}.t.mdx` auto-translation).

---

## Adding a new post

1. Create a directory: `src/content/blog/{year}/{slug}/`
2. Write the original in your language: `index.en.mdx` or `index.es.mdx`
3. Run the translation script to generate the other-language version.
4. Commit both files.

If you don't run the translation, the EN version will be served as a fallback at `/es/{slug}` until a Spanish translation is added.
