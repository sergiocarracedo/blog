# remark-directive-code-from

Loads a local text file at build time and renders it as a regular code block.

The rendered block keeps the normal Astro/Shiki code-block pipeline and adds a
small header with the source filename plus a button to download the original
file.

## Syntax

Recommended alias:

```markdown
::codefrom[]{path="./assets/input.json"}
```

Also supported:

```markdown
::code-from[]{path="./assets/input.json"}
```

## Attributes

| Attribute | Required | Description |
| --- | --- | --- |
| `path` | yes | File to load. Supports paths relative to the current MDX file, or content-root paths starting with `/`. |
| `lang` | no | Override the code-block language. If omitted, the plugin infers it from the file extension. |
| `meta` | no | Extra code-block metadata passed through to the generated mdast `code` node. |
| `title` | no | Title shown in the header above the code block. Defaults to the source filename. |
| `download-label` | no | Label for the download button. `downloadLabel` is also supported as an alias. |
| `encoding` | no | File encoding used to read the source file. Defaults to `utf8`. |
| `from` | no | First line to include, 1-based. |
| `to` | no | Last line to include, 1-based. |
| `lines` | no | Explicit line selection, using comma-separated values and ranges such as `1,4-8,12`. |

## Path Resolution

### Relative to the current MDX file

```markdown
::codefrom[]{path="./assets/input.json"}
```

### Relative to `src/content`

```markdown
::codefrom[]{path="/blog/2026/2026-04-26-ai-context-in-deep/assets/input.json"}
```

Absolute-style paths are resolved from the content root, not from the filesystem root.

## Line Selection

Include a contiguous range:

```markdown
::codefrom[]{path="./assets/input.json" from="1" to="22"}
```

Include explicit lines and ranges:

```markdown
::codefrom[]{path="./assets/input.json" lines="1,4-8,12"}
```

If line selection is used, the block header shows the selected range.

## Examples

Basic usage:

```markdown
::codefrom[]{path="./assets/input.json"}
```

Force the language and custom title:

```markdown
::codefrom[]{path="./assets/system-instructions._md" lang="md" title="System instructions excerpt"}
```

Custom download label:

```markdown
::codefrom[]{path="./assets/input.json" download-label="Download full payload"}
```

Slice a file:

```markdown
::codefrom[]{path="./assets/input.json" from="1" to="22" title="Gemini request payload"}
```

## Notes

- Only local files are supported.
- The target must be a file, not a directory.
- The plugin reads files synchronously at build time.
- Binary files are not a supported use case.
