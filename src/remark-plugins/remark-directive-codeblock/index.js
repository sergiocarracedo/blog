import { visit } from 'unist-util-visit';

function normalizeCssSize(value) {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'none') return 'none';

  // If it's a plain number, treat it as px.
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) return `${trimmed}px`;

  return trimmed;
}

/**
 * Usage (container directive):
 * :::codeblock{maxHeight=300px}
 * ```ts
 * ...
 * ```
 * :::
 *
 * Sets CSS var `--code-block-max-h` on a wrapper element so `pre` can read it.
 */
export function remarkDirectiveCodeblock() {
  return (tree) => {
    visit(tree, ['containerDirective'], (node) => {
      if (node.name !== 'codeblock') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};

      const maxHeight = normalizeCssSize(
        attributes.maxHeight ?? attributes.maxheight ?? attributes.height
      );

      data.hName = 'div';
      data.hProperties = data.hProperties || {};

      const existingStyle = data.hProperties.style ? String(data.hProperties.style) : '';
      const styleParts = existingStyle
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean);

      if (maxHeight) {
        styleParts.push(`--code-block-max-h: ${maxHeight}`);
      }

      data.hProperties.style = styleParts.join('; ');

      // Optional class for future styling/debugging.
      const className = data.hProperties.className || [];
      data.hProperties.className = Array.isArray(className)
        ? [...className, 'codeblock']
        : [className, 'codeblock'];
    });
  };
}
