import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace ::asciinema[DESCRIPTION](id="ASCIINEMAID"): with an Asciinema embed script.
 */
export function remarkDirectiveASCIInema() {
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'asciinema') return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const id = attributes.id;

      if (!id) {
        file.fail('Unexpected missing `id` on `asciinema` directive', node);
      }

      // Replace the directive node with an HTML node embedding the Asciinema player
      node.type = 'html';
      node.value = `<script src="https://asciinema.org/a/${id}.js" id="asciicast-${id}" async></script>`;
      node.children = [];
    });
  };
}
