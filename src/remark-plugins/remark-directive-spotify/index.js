import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace ::spotify[DESCRIPTION](#SPOTIFYID): with a custom Spotify embed Astro component.
 */
export function remarkDirectiveSpotify() {
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'spotify') {
        return
      }

      const data = node.data || (node.data = {})
      const attributes = node.attributes || {}
      const id = attributes.id
      const type = attributes.type || 'track'; // Default to 'track' if not specified
      const width = attributes.width || '100%'; // Default width
      const height = attributes.height || '380'; // Default height


      if (node.type === 'textDirective') {
        file.fail(
          'Unexpected `:spotify` text directive, use two colons for a leaf directive',
          node
        )
      }

      if (!id) {
        file.fail('Unexpected missing `id` on `spotify` directive', node)
      }

      node.type = 'mdxJsxFlowElement';
      node.name = 'SpotifyEmbed';
      node.attributes = [
        { type: 'mdxJsxAttribute', name: 'id', value: id },
        { type: 'mdxJsxAttribute', name: 'type', value: type },
        { type: 'mdxJsxAttribute', name: 'width', value: width },
        { type: 'mdxJsxAttribute', name: 'height', value: height }
      ];
      node.children = [];
    });
  }
}
