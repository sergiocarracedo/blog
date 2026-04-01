import { visit } from 'unist-util-visit';

export function remarkDirectiveCenter() {
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (node.name !== 'center') {
        return;
      }

      if (node.type !== 'containerDirective') {
        file.fail(
          'Unexpected `:center` directive, use two colons with opening and closing markers',
          node
        );
      }

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const existingClassName = data.hProperties?.className;
      const className = [
        existingClassName,
        attributes.className,
        attributes.class,
        'center-directive',
      ].flatMap((value) => {
        if (!value) return [];
        return Array.isArray(value)
          ? value.flatMap((item) => String(item).split(/\s+/).filter(Boolean))
          : String(value).split(/\s+/).filter(Boolean);
      });

      const existingStyle = data.hProperties?.style ? String(data.hProperties.style) : '';
      const styleParts = existingStyle
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean);

      styleParts.push('text-align: center');

      data.hName = 'div';
      data.hProperties = {
        ...(data.hProperties || {}),
        className: [...new Set(className)],
        style: styleParts.join('; '),
      };
    });
  };
}
