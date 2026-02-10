import { visit } from 'unist-util-visit';

/**
 * Remark plugin to render a responsive image gallery with modal.
 *
 * Usage with attributes:
 * :::gallery{images="image1.jpg,image2.jpg" cols="2"}
 * :::
 *
 * Or with content (one image per line):
 * :::gallery{cols="2"}
 * image1.jpg
 * image2.jpg
 * :::
 */
export function remarkDirectiveGallery() {
  return (tree, file) => {
    visit(tree, ['containerDirective'], (node) => {
      if (node.name !== 'gallery') {
        return;
      }

      const attributes = node.attributes || {};
      let imagesStr = attributes.images;
      const cols = attributes.cols ? parseInt(attributes.cols, 10) : 3;

      // If no images attribute, try to extract from node content
      if (!imagesStr && node.children && node.children.length > 0) {
        // Extract text content from children (recursively handle paragraphs)
        const extractText = (child) => {
          if (child.type === 'text') return child.value;
          if (child.type === 'paragraph' && child.children) {
            return child.children.map(extractText).join('');
          }
          return '';
        };

        const textContent = node.children.map(extractText).join('\n');
        imagesStr = textContent.trim();
      }

      if (!imagesStr) {
        file.fail('Unexpected missing `images` on `gallery` directive', node);
      }

      // Parse images - handle comma-separated list or newline-separated
      const images = imagesStr
        .split(/[,\n]/)
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      if (images.length === 0) {
        file.fail('No valid images provided to `gallery` directive', node);
      }

      // Validate cols is between 1 and 6
      const validCols = Math.max(1, Math.min(6, cols));

      // Transform to MDX JSX component
      const data = node.data || (node.data = {});
      data.hName = 'GalleryModal';
      data.hProperties = {
        images: JSON.stringify(images),
        cols: validCols,
      };

      // Clear children - we don't need them anymore
      node.children = [];
    });
  };
}
