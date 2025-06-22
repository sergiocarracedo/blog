import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace ::iframe[DESCRIPTION](src=IFRAMEID width= hieght): with a custom Iframe embed Astro component.
 */
export function remarkDirectiveIframe() {
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'iframe') {
        return
      }

      const data = node.data || (node.data = {})
      const attributes = node.attributes || {}
      const src = attributes.src
      const width = attributes.width || '100%'; // Default width
      const height = attributes.height || '380'; // Default height


      if (node.type === 'textDirective') {
        file.fail(
          'Unexpected `:iframe` text directive, use two colons for a leaf directive',
          node
        )
      }

      if (!src) {
        file.fail('Unexpected missing `src` on `iframe` directive', node)
      }

      node.type = 'html';
      node.value = `<iframe src="${src}" width="${width}" height="${height}" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
      node.children = [];
    });
  }
}
