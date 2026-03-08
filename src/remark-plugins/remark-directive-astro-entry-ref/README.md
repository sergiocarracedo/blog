# remark-directive-astro-entry-ref

Creates internal cross-post links at build time. Resolves a content collection entry path to its correct localized URL and uses the target post's frontmatter `title` as the link text by default.

Also available as `:astro-ref` and `:astro-entry-ref` (all three names are equivalent).

## Syntax

```
:entry-ref[Link text]{path="CONTENT_PATH"}
:entry-ref[Link text]{path="CONTENT_PATH" fragment="ANCHOR"}
:entry-ref[Link text]{path="CONTENT_PATH" lang="es"}
```

| Attribute  | Required | Description                                                                         |
| ---------- | -------- | ----------------------------------------------------------------------------------- |
| `path`     | yes      | Path to the content entry relative to `src/content/` (e.g. `blog/2026/my-post`)     |
| `fragment` | no       | URL fragment/anchor to append (without `#`)                                         |
| `lang`     | no       | Force a specific locale (`en` or `es`). Defaults to the locale of the current file. |

> Use `:entry-ref` (single colon — text directive). `::entry-ref` will error.

### Locale resolution

The plugin picks the best-matching file for the target entry in this priority order:

1. Exact locale match: `index.{locale}.mdx`, `index.{locale}.t.mdx`
2. Other locale fallback: `index.{other}.mdx`, `index.{other}.t.mdx`
3. Legacy plain file: `index.mdx`, `index.md`

The resolved file's locale determines the URL prefix (`/` for EN, `/es/` for ES).

## Examples

Link using the post's frontmatter title as text:

```markdown
See my post :entry-ref[]{path="blog/2026/my-post"} for more details.
```

Link with custom text:

```markdown
Read more about :entry-ref[custom link text]{path="blog/2026/my-post"}.
```

Link to a specific section:

```markdown
Check the :entry-ref[installation steps]{path="blog/2026/my-post" fragment="installation"}.
```

Force Spanish locale regardless of the current file's locale:

```markdown
:entry-ref[Ver en español]{path="blog/2026/my-post" lang="es"}
```
