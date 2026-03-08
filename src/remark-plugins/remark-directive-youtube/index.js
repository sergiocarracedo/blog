import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace ::youtube[DESCRIPTION](#YOUTUBEID): with a custom YouTube embed Astro component.
 */
export function remarkDirectiveYoutube() {
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'youtube') {
        return
      }

      const data = node.data || (node.data = {})
      const attributes = node.attributes || {}
      const id = attributes.id


      if (node.type === 'textDirective') {
        file.fail(
          'Unexpected `:youtube` text directive, use two colons for a leaf directive',
          node
        )
      }

      if (!id) {
        file.fail('Unexpected missing `id` on `youtube` directive', node)
      }

      node.type = 'mdxJsxFlowElement';
      node.name = 'YoutubeEmbed';
      node.attributes = [
        { type: 'mdxJsxAttribute', name: 'id', value: id }
      ];
      node.children = [];
    });
  }
}
