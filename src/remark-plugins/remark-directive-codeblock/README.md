# remark-directive-codeblock

Wraps a code block in a `<div class="codeblock">` with a configurable max height, enabling a scrollable code block via the `--code-block-max-h` CSS custom property.

## Syntax

````
:::codeblock{maxHeight="VALUE"}
```code
...
````

:::

````

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `maxHeight` | no | — | Max height of the code block. Plain numbers are treated as `px`. Use `none` to remove limit. Also accepts `maxheight` or `height`. |

## Examples

Limit to 300 pixels:

```markdown
:::codeblock{maxHeight="300"}
```ts
function hello() {
  console.log("Hello, world!");
}
````

:::

````

Using an explicit CSS unit:

```markdown
:::codeblock{maxHeight="20rem"}
```bash
#!/bin/bash
echo "This is a very long script..."
````

:::

````

Remove the height limit:

```markdown
:::codeblock{maxHeight="none"}
```js
// ...
````

:::

```

```
