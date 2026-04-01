import { visit } from 'unist-util-visit';

export function remarkDirectiveBtn(options = {}) {
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (!['btn'].includes(node.name)) {
        return;
      }

      if (node.type !== 'textDirective') {
        file.fail('Unexpected `::btn` directive, use one colon for a text directive', node);
      }

      const attributes = node.attributes || {};

      const url = attributes.url;

      if (!url) {
        file.fail('Missing `url` attribute on `btn` directive', node);
      }

      // Determine link text: directive children → frontmatter title → slug fallback
      let linkText;
      if (
        Array.isArray(node.children) &&
        node.children.length > 0 &&
        node.children[0].type === 'text' &&
        node.children[0].value
      ) {
        linkText = node.children[0].value;
      } else {
        linkText = parsed.data.title || parsed.data.slug || postPath;
      }

      const existingClassName = node.data?.hProperties?.className;

      const classNames = [
        existingClassName,
        attributes.className,
        attributes.class,
        'btn',
        'mb-2',
        'inline-block',
      ].flatMap((value) => {
        if (!value) return [];
        return Array.isArray(value)
          ? value.flatMap((item) => String(item).split(/\s+/).filter(Boolean))
          : String(value).split(/\s+/).filter(Boolean);
      });
      const className = [...new Set(classNames)];
      const data = node.data || (node.data = {});

      data.hName = 'a';
      data.hProperties = {
        ...(data.hProperties || {}),
        href: url,
        className,
      };

      node.children = [{ type: 'text', value: linkText }];
    });
  };
}
