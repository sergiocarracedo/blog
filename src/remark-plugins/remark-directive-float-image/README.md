# remark-directive-float-image

Renders a floated image alongside text. Passes the image through Astro's normal image optimization pipeline while adding float/margin/max-width inline styles.

## Syntax

```
::float-image[Alt text]{src="PATH" float="left|right" maxWidth="VALUE"}
```

| Attribute  | Required | Default | Description                                           |
| ---------- | -------- | ------- | ----------------------------------------------------- |
| `src`      | yes      | —       | Image path (relative to the MDX file or absolute URL) |
| `float`    | no       | `left`  | Float direction: `left` or `right`                    |
| `maxWidth` | no       | `50%`   | Max width. Plain numbers are treated as `px`.         |

## Examples

Float left (default):

```markdown
::float-image[A screenshot of the dashboard]{src="./dashboard.png"}

Lorem ipsum dolor sit amet, consectetur adipiscing elit...
```

Float right with custom width:

```markdown
::float-image[Project logo]{src="./logo.png" float="right" maxWidth="200"}

Lorem ipsum dolor sit amet...
```

Float left at 30% width:

```markdown
::float-image[Diagram]{src="./arch-diagram.svg" maxWidth="30%"}
```
