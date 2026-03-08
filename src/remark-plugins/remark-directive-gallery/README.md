# remark-directive-gallery

Renders a responsive image gallery with a modal viewer via the `GalleryModal` Astro component. Images are passed through Astro's asset pipeline for optimization.

## Syntax

Images can be provided as a comma-separated attribute or as content lines inside the directive block.

```
:::gallery{images="img1.jpg,img2.jpg" cols="3"}
:::
```

```
:::gallery{cols="2"}
img1.jpg
img2.jpg
img3.jpg
:::
```

| Attribute | Required | Default | Description                         |
| --------- | -------- | ------- | ----------------------------------- |
| `images`  | no\*     | —       | Comma-separated list of image paths |
| `cols`    | no       | `3`     | Number of columns (1–6)             |

\* Required if no image paths are provided as block content.

## Examples

Inline attribute list:

```markdown
:::gallery{images="./photo1.jpg,./photo2.jpg,./photo3.jpg"}
:::
```

Block content — one image per line:

```markdown
:::gallery{cols="2"}
./photo1.jpg
./photo2.jpg
./photo3.jpg
./photo4.jpg
:::
```

Four columns:

```markdown
:::gallery{images="./a.jpg,./b.jpg,./c.jpg,./d.jpg,./e.jpg,./f.jpg,./g.jpg,./h.jpg" cols="4"}
:::
```
