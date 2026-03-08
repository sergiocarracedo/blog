# remark-directive-iframe

Embeds any URL inside an `<iframe>`.

## Syntax

```
::iframe{src="URL"}
::iframe{src="URL" width="WIDTH" height="HEIGHT"}
```

| Attribute | Required | Default | Description                        |
| --------- | -------- | ------- | ---------------------------------- |
| `src`     | yes      | —       | URL to embed                       |
| `width`   | no       | `100%`  | iframe width (any valid CSS value) |
| `height`  | no       | `380`   | iframe height in pixels            |

> Use `::` (leaf directive) or `:::` (container directive). `:iframe` (single colon) will error.

## Examples

Basic embed:

```markdown
::iframe{src="https://example.com/embed/map"}
```

With custom dimensions:

```markdown
::iframe{src="https://codesandbox.io/embed/abc123" width="100%" height="500"}
```
