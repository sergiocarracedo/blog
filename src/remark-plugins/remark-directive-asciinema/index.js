import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace ::asciinema directives with an Asciinema embed.
 *
 * Supports two modes:
 *   - Remote (asciinema.org hosted): ::asciinema[]{id="ASCIINEMAID"}
 *   - Local .cast file: ::asciinema[]{src="./recording.cast"}
 *     The src is treated as relative to the markdown file.
 *
 * Optional attributes for local mode: cols, rows, autoPlay, loop, speed, idleTimeLimit, theme, fit
 */
export function remarkDirectiveASCIInema() {
  return (tree, file) => {
    // Track import names already added to this file to avoid duplicates.
    const importedCasts = new Map();

    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'asciinema') return;

      const attributes = node.attributes || {};
      const id = attributes.id;
      const src = attributes.src;

      if (!id && !src) {
        file.fail('Missing `id` or `src` on `asciinema` directive', node);
      }

      node.type = 'html';
      node.children = [];

      if (src) {
        // Local .cast mode.
        // Vite is configured with `assetsInclude: ['**/*.cast']`, so importing a
        // .cast file with `?url` gives a hashed public URL at build time — the
        // same mechanism Astro uses for local images.  We emit a mdxjsEsm import
        // node at the top of the MDX file and pass the imported identifier as the
        // `src` prop via an expression attribute, so the player receives the
        // correct content-hashed URL rather than the raw relative path.
        let importName = importedCasts.get(src);
        if (!importName) {
          importName = `__cast_${importedCasts.size}_${src.replace(/\W/g, '_')}__`;
          importedCasts.set(src, importName);

          // Inject: import __cast_0_...__ from "./file.cast?url";
          tree.children.unshift({
            type: 'mdxjsEsm',
            value: '',
            data: {
              estree: {
                type: 'Program',
                sourceType: 'module',
                body: [
                  {
                    type: 'ImportDeclaration',
                    attributes: [],
                    source: {
                      type: 'Literal',
                      value: `${src}?url`,
                      raw: JSON.stringify(`${src}?url`),
                    },
                    specifiers: [
                      {
                        type: 'ImportDefaultSpecifier',
                        local: { type: 'Identifier', name: importName },
                      },
                    ],
                  },
                ],
              },
            },
          });
        }

        // Build the expression attribute: src={importName}
        const srcExprAttr = {
          type: 'mdxJsxAttribute',
          name: 'src',
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: importName,
            data: {
              estree: {
                type: 'Program',
                sourceType: 'module',
                comments: [],
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: { type: 'Identifier', name: importName },
                  },
                ],
              },
            },
          },
        };

        const jsxAttributes = [srcExprAttr];
        if (attributes.cols)
          jsxAttributes.push({ type: 'mdxJsxAttribute', name: 'cols', value: attributes.cols });
        if (attributes.rows)
          jsxAttributes.push({ type: 'mdxJsxAttribute', name: 'rows', value: attributes.rows });
        if (attributes.autoPlay)
          jsxAttributes.push({
            type: 'mdxJsxAttribute',
            name: 'autoPlay',
            value: attributes.autoPlay,
          });
        if (attributes.loop)
          jsxAttributes.push({ type: 'mdxJsxAttribute', name: 'loop', value: attributes.loop });
        if (attributes.speed)
          jsxAttributes.push({ type: 'mdxJsxAttribute', name: 'speed', value: attributes.speed });
        if (attributes.idleTimeLimit) {
          jsxAttributes.push({
            type: 'mdxJsxAttribute',
            name: 'idleTimeLimit',
            value: attributes.idleTimeLimit,
          });
        }
        if (attributes.theme)
          jsxAttributes.push({ type: 'mdxJsxAttribute', name: 'theme', value: attributes.theme });
        if (attributes.fit)
          jsxAttributes.push({ type: 'mdxJsxAttribute', name: 'fit', value: attributes.fit });

        node.type = 'mdxJsxFlowElement';
        node.name = 'AsciinemaPlayer';
        node.attributes = jsxAttributes;
        node.children = [];
      } else {
        // Remote mode — asciinema.org hosted recording
        node.value = `<script src="https://asciinema.org/a/${id}.js" id="asciicast-${id}" async></script>`;
      }
    });
  };
}
