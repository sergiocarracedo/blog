import fs from 'fs';
import matter from 'gray-matter';
import pathModule from 'path';
import { visit } from 'unist-util-visit';

/**
 * Remark plugin to replace :entry-ref[DESCRIPTION](POST_PATH) with a link to the post using the slug/id
 */
function findAndLoadEntryFile(postPath, extensions, file, node, contentBaseDir) {
  const baseDir = contentBaseDir || pathModule.resolve(process.cwd(), 'src/content');
  const entryFile = pathModule.join(baseDir, postPath);
  if (fs.existsSync(entryFile) && fs.lstatSync(entryFile).isDirectory()) {
    // Try all possible index extensions in order
    for (const ext of extensions) {
      const candidate = pathModule.join(entryFile, `index.${ext}`);
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf8');
      }
    }
    file.fail(`Could not find any index file (index.[${extensions.join(', ')}]) in directory: ${postPath}`, node);
  } else if (fs.existsSync(entryFile)) {
    // If postPath is a file, just read it
    return fs.readFileSync(entryFile, 'utf8');
  } else {
    file.fail(`Could not find entry file or directory for path: ${postPath}`, node);
  }
}

export function remarkDirectiveAstroEntryRef(options = {}) {
  // Allow passing extensions as options, default to ['mdx', 'md']
  const extensions = options.extensions || ['mdx', 'md'];
  const contentBaseDir = options.contentBaseDir;
  return (tree, file) => {
    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (!['entry-ref', 'astro-ref', 'astro-entry-ref'].includes(node.name)) {
        return;
      }

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};
      const postPath = attributes.path;
      const postFragment = attributes.fragment;

      if (node.type !== 'textDirective') {
        file.fail(
          'Unexpected `::entry-ref` directive, use one colon for a text directive',
          node
        );
      }

      if (!postPath) {
        file.fail('Missing `path` attribute on `entry-ref` directive', node);
      }

      let idOrSlug = null;
      let fileContent = null;
      try {
        fileContent = findAndLoadEntryFile(postPath, extensions, file, node, contentBaseDir);
        const parsed = matter(fileContent);
        idOrSlug = parsed.data.id || parsed.data.slug;
      } catch (err) {
        file.fail(`Could not read or parse entry at ${postPath}: ${err.message}`, node);
      }

      if (!idOrSlug) {
        file.fail('Could not extract id or slug from entry frontmatter', node);
      }

      // Replace the directive with a markdown link to the entry using the slug/id
      node.type = 'link';
      node.url = `${idOrSlug}${postFragment ? `#${postFragment}` : ''}`;
      // Use the text between [] in the directive (node.children[0].value) as link text, fallback to entry title, then idOrSlug
      let linkText = idOrSlug;
      if (Array.isArray(node.children) && node.children.length > 0 && node.children[0].type === 'text' && node.children[0].value) {
        linkText = node.children[0].value;
      } else {
        const parsed = matter(fileContent);
        linkText = parsed.data.title || idOrSlug;
      }
      node.children = [{ type: 'text', value: linkText }];
    });
  };
}
