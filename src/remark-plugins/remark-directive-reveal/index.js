import pathModule from 'path';
import { visit } from 'unist-util-visit';

function getLocaleFromFilePath(filePath) {
  if (!filePath) return 'en';
  const basename = pathModule.basename(filePath);
  const m = basename.match(/^index\.(en|es)(\.t)?\.(md|mdx)$/);
  return m ? m[1] : 'en';
}

export function remarkDirectiveReveal() {
  return (tree, file) => {
    const locale = getLocaleFromFilePath(file.path);
    const defaultSummary = locale === 'es'
      ? 'Muestra el contenido oculto'
      : 'Reveal hidden content';

    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'reveal') {
        return;
      }

      if (node.type !== 'containerDirective') {
        file.fail(
          'Unexpected `:reveal` directive, use two colons with opening and closing markers',
          node,
        );
      }

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const summaryText = attributes.summary || attributes.title || defaultSummary;

      data.hName = 'details';
      data.hProperties = {
        ...(data.hProperties || {}),
        className: ['reveal-directive'],
      };

      node.children = [
        {
          type: 'html',
          value: `<summary>${summaryText}</summary>`,
        },
        ...node.children,
      ];
    });
  };
}
