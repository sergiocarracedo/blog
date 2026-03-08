# remark-directive-youtube

Embeds a YouTube video via the `YoutubeEmbed` Astro component.

## Syntax

```
::youtube{id="VIDEO_ID"}
```

| Attribute | Required | Description                                        |
| --------- | -------- | -------------------------------------------------- |
| `id`      | yes      | YouTube video ID (the part after `?v=` in the URL) |

## Examples

```markdown
::youtube{id="dQw4w9WgXcQ"}
```

```markdown
::youtube{id="ScMzIvxBSi4"}
```
