import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace :::gallery directive with a responsive image grid.
 * 
 * Usage:
 * :::gallery
 * images: image1.jpg,image2.jpg,image3.jpg
 * cols: 3
 * :::
 */
export function remarkDirectiveGallery() {
  return (tree, file) => {
    visit(tree, ['containerDirective'], (node) => {
      if (node.name !== 'gallery') {
        return;
      }

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const imagesStr = attributes.images;
      const cols = attributes.cols ? parseInt(attributes.cols, 10) : 3;

      if (!imagesStr) {
        file.fail('Unexpected missing `images` on `gallery` directive', node);
      }

      // Parse images - handle comma-separated list
      const images = imagesStr
        .split(',')
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      if (images.length === 0) {
        file.fail('No valid images provided to `gallery` directive', node);
      }

      // Validate cols is between 1 and 6
      const validCols = Math.max(1, Math.min(6, cols));

      // Generate responsive grid HTML
      const imageElements = images
        .map(
          (src) =>
            `<img src="${src}" alt="Gallery image" class="gallery-img" loading="lazy" />`
        )
        .join('\n');

      const gridHtml = `<div class="gallery-grid" style="--gallery-cols: ${validCols}">
${imageElements}
</div>`;

      node.type = 'html';
      node.value = gridHtml;
      node.children = [];
    });
  };
}
