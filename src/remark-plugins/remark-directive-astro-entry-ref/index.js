import fs from 'fs';
import matter from 'gray-matter';
import pathModule from 'path';
import { visit } from 'unist-util-visit';

/**
 * Derive the locale ('en' | 'es') from a file path, based on the filename suffix.
 * e.g. ".../index.es.mdx"     → 'es'
 *      ".../index.es.t.mdx"   → 'es'
 *      ".../index.en.mdx"     → 'en'
 *      ".../index.en.t.mdx"   → 'en'
 *      ".../index.mdx"        → 'en'  (legacy plain file, assumed EN)
 */
function getLocaleFromFilePath(filePath) {
  if (!filePath) return 'en';
  const basename = pathModule.basename(filePath);
  const m = basename.match(/^index\.(en|es)(\.t)?\.(md|mdx)$/);
  return m ? m[1] : 'en';
}

/**
 * Build candidate filenames to try, in priority order.
 *
 * Priority:
 *   1. Exact locale match (same as calling file): index.{locale}.mdx, index.{locale}.t.mdx
 *   2. Fallback to other locale:                  index.{other}.mdx,  index.{other}.t.mdx
 *   3. Legacy plain:                              index.mdx, index.md
 */
function buildCandidates(locale, extensions) {
  const other = locale === 'en' ? 'es' : 'en';
  const candidates = [];
  for (const ext of extensions) {
    // 1. Exact locale (original first, then auto-translated)
    candidates.push(`index.${locale}.${ext}`);
    candidates.push(`index.${locale}.t.${ext}`);
  }
  for (const ext of extensions) {
    // 2. Other locale fallback
    candidates.push(`index.${other}.${ext}`);
    candidates.push(`index.${other}.t.${ext}`);
  }
  for (const ext of extensions) {
    // 3. Legacy plain
    candidates.push(`index.${ext}`);
  }
  return candidates;
}

/**
 * Given the resolved target file's path, derive the URL for that post.
 *
 * Rules:
 *   - EN  file → /{slug}
 *   - ES  file → /es/{slug}
 *
 * The slug comes from frontmatter `slug`, falling back to the directory name.
 */
function buildUrl(targetFilePath, frontmatter, fragment) {
  // Determine the locale of the resolved file
  const basename = pathModule.basename(targetFilePath);
  const localeMatch = basename.match(/^index\.(en|es)(\.t)?\.(md|mdx)$/);
  const fileLocale = localeMatch ? localeMatch[1] : 'en';

  // Derive slug: prefer frontmatter slug, else use directory name
  let slug = frontmatter.slug;
  if (!slug) {
    // e.g. ".../blog/2026/2026-02-15-ai-stack/index.en.mdx" → "2026/2026-02-15-ai-stack"
    const dir = pathModule.dirname(targetFilePath);
    // Strip everything up to and including "/blog/"
    const m = dir.match(/[/\\]blog[/\\](.+)$/);
    slug = m ? m[1] : pathModule.basename(dir);
  }

  const fragmentSuffix = fragment ? `#${fragment}` : '';

  if (fileLocale === 'es') {
    return `/es/${slug}${fragmentSuffix}`;
  }
  return `/${slug}${fragmentSuffix}`;
}

/**
 * Resolve and load the best-matching locale file for a given post path.
 *
 * @param {string} postPath    - Post path from the directive attribute (e.g. "blog/2026/foo")
 * @param {string} locale      - Target locale to prefer ('en' | 'es')
 * @param {string[]} extensions
 * @param {object} file        - VFile (for error reporting)
 * @param {object} node        - AST node (for error reporting)
 * @param {string} contentBaseDir
 * @returns {{ content: string, filePath: string }}
 */
function findAndLoadEntryFile(postPath, locale, extensions, file, node, contentBaseDir) {
  const baseDir = contentBaseDir || pathModule.resolve(process.cwd(), 'src/content');
  const entryPath = pathModule.join(baseDir, postPath);

  if (fs.existsSync(entryPath) && fs.lstatSync(entryPath).isDirectory()) {
    const candidates = buildCandidates(locale, extensions);
    for (const candidate of candidates) {
      const candidatePath = pathModule.join(entryPath, candidate);
      if (fs.existsSync(candidatePath)) {
        return { content: fs.readFileSync(candidatePath, 'utf8'), filePath: candidatePath };
      }
    }
    file.fail(
      `Could not find any index file for locale "${locale}" in directory: ${postPath}` +
        ` (tried: ${candidates.slice(0, 4).join(', ')}, …)`,
      node
    );
  } else if (fs.existsSync(entryPath)) {
    return { content: fs.readFileSync(entryPath, 'utf8'), filePath: entryPath };
  } else {
    file.fail(`Could not find entry file or directory for path: ${postPath}`, node);
  }
}

export function remarkDirectiveAstroEntryRef(options = {}) {
  const extensions = options.extensions || ['mdx', 'md'];
  const contentBaseDir = options.contentBaseDir;

  return (tree, file) => {
    // Locale of the file currently being processed
    const currentLocale = getLocaleFromFilePath(file.path);

    visit(tree, ['textDirective', 'leafDirective', 'containerDirective'], (node) => {
      if (!['entry-ref', 'astro-ref', 'astro-entry-ref'].includes(node.name)) {
        return;
      }

      if (node.type !== 'textDirective') {
        file.fail('Unexpected `::entry-ref` directive, use one colon for a text directive', node);
      }

      const attributes = node.attributes || {};
      const postPath = attributes.path;
      const postFragment = attributes.fragment;
      // Optional explicit locale override: :astro-ref[text]{path="..." lang="es"}
      const targetLocale = attributes.lang || currentLocale;

      if (!postPath) {
        file.fail('Missing `path` attribute on `entry-ref` directive', node);
      }

      let resolved = null;
      try {
        resolved = findAndLoadEntryFile(
          postPath,
          targetLocale,
          extensions,
          file,
          node,
          contentBaseDir
        );
      } catch (err) {
        file.fail(`Could not read or parse entry at ${postPath}: ${err.message}`, node);
      }

      const parsed = matter(resolved.content);
      const url = buildUrl(resolved.filePath, parsed.data, postFragment);

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

      // Replace directive node with a plain markdown link
      node.type = 'link';
      node.url = url;
      node.children = [{ type: 'text', value: linkText }];
    });
  };
}
