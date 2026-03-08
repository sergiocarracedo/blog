import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace ::float-image[DESCRIPTION](src=IMAGE_SRC float='left|right' maxWidth=120): with a floating image.
 */
export function remarkDirectiveFloatImage() {
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'float-image') {
        return;
      }

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const src = attributes.src;
      const rawMaxWidth = attributes.maxWidth;
      const maxWidth =
        typeof rawMaxWidth === 'string' && /^\d+$/.test(rawMaxWidth)
          ? `${rawMaxWidth}px`
          : rawMaxWidth || '50%';
      const float = attributes.float || 'left';
      const margin = float === 'right' ? '0 0 1em 1em' : '0 1em 1em 0';

      if (!src) {
        file.fail('Unexpected missing `src` on `float-image` directive', node);
      }

      const alt =
        Array.isArray(node.children) &&
        node.children.length > 0 &&
        node.children[0].type === 'text' &&
        typeof node.children[0].value === 'string'
          ? node.children[0].value
          : '';

      // Emit a proper MDAST `image` node (not a markdown string). This way the
      // downstream Markdown/MDX pipeline keeps processing it normally.
      data.hProperties = {
        ...data.hProperties,
        className: Array.isArray(data.hProperties?.className)
          ? [...data.hProperties.className, 'float-image']
          : ['float-image'],
        style: `float: ${float}; margin: ${margin}; max-width: ${maxWidth};`,
      };

      node.type = 'image';
      node.url = src;
      node.alt = alt;
      node.title = null;
      node.children = [];
    });
  };
}
