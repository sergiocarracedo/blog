#!/usr/bin/env tsx

/**
 * Translate All Posts Script
 *
 * Batch translates blog posts that are missing translations.
 *
 * Usage:
 *   pnpm translate:all --to es
 *   pnpm translate:all --to en --missing-only
 *
 * Environment Variables:
 *   AI_PROVIDER: 'openai' | 'anthropic' | 'google' (default: 'openai')
 *   OPENAI_API_KEY: OpenAI API key
 *   ANTHROPIC_API_KEY: Anthropic API key
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

type Locale = 'en' | 'es';

interface PostInfo {
  path: string;
  lang?: Locale;
  hasTranslation: { en: boolean; es: boolean };
}

/**
 * Find all blog posts.
 *
 * Each post directory is emitted once. The "source" file is chosen as:
 *   1. index.en.mdx  (EN original)
 *   2. index.es.mdx  (ES original)
 *   3. index.mdx / index.md  (legacy EN-original)
 * Directories are deduplicated by directory path.
 */
function findBlogPosts(dir: string): PostInfo[] {
  const posts: PostInfo[] = [];
  const blogDir = path.join(dir, 'src/content/blog');

  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const names = entries.map((e) => e.name);

    // Decide the source file for this directory (process directories, not individual files)
    const isLeafDir =
      names.includes('index.mdx') ||
      names.includes('index.md') ||
      names.includes('index.es.mdx') ||
      names.includes('index.en.mdx');

    if (isLeafDir) {
      const postDir = currentDir;

      // Pick the best source file in priority order: EN original first, then ES original, then legacy
      const sourceFile = ['index.en.mdx', 'index.es.mdx', 'index.mdx', 'index.md']
        .map((n) => path.join(postDir, n))
        .find((p) => fs.existsSync(p));

      if (sourceFile) {
        const content = fs.readFileSync(sourceFile, 'utf-8');
        const langMatch = content.match(/^lang:\s*(\w+)/m);
        const lang = langMatch ? (langMatch[1] as Locale) : undefined;

        // Detect EN version: index.en.mdx (original), index.en.t.mdx (translation), or legacy plain index.mdx
        const hasEn =
          fs.existsSync(path.join(postDir, 'index.en.mdx')) ||
          fs.existsSync(path.join(postDir, 'index.en.t.mdx')) ||
          fs.existsSync(path.join(postDir, 'index.en.md')) ||
          fs.existsSync(path.join(postDir, 'index.en.t.md')) ||
          // plain index.mdx with lang:en counts as the EN version
          ((names.includes('index.mdx') || names.includes('index.md')) && lang === 'en') ||
          // plain index.mdx with no lang is assumed EN
          ((names.includes('index.mdx') || names.includes('index.md')) && !lang);

        // Detect ES version: index.es.mdx (original), index.es.t.mdx (translation), or legacy plain index.mdx
        const hasEs =
          fs.existsSync(path.join(postDir, 'index.es.mdx')) ||
          fs.existsSync(path.join(postDir, 'index.es.t.mdx')) ||
          fs.existsSync(path.join(postDir, 'index.es.md')) ||
          fs.existsSync(path.join(postDir, 'index.es.t.md')) ||
          // plain index.mdx with lang:es counts as the ES version
          ((names.includes('index.mdx') || names.includes('index.md')) && lang === 'es');

        posts.push({ path: sourceFile, lang, hasTranslation: { en: hasEn, es: hasEs } });
      }
      // Don't recurse into leaf dirs (images etc. live alongside, not nested posts)
      return;
    }

    // Not a post directory — recurse into subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        scanDir(path.join(currentDir, entry.name));
      }
    }
  }

  scanDir(blogDir);
  return posts;
}

/**
 * Translate a single post
 */
async function translatePost(
  postPath: string,
  targetLang: Locale,
  dryRun: boolean
): Promise<boolean> {
  const scriptPath = path.join(process.cwd(), 'scripts/translate-post.ts');
  const cmd = `npx tsx ${scriptPath} --file "${postPath}" --to ${targetLang}${dryRun ? ' --dry-run' : ''}`;

  try {
    console.log(`\nTranslating: ${postPath}`);
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to translate: ${postPath}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  let targetLang: Locale = 'es';
  let missingOnly = false;
  let dryRun = false;
  let limit = 0;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' || args[i] === '-t') {
      targetLang = args[++i] as Locale;
    } else if (args[i] === '--missing-only') {
      missingOnly = true;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--limit') {
      limit = parseInt(args[++i], 10);
    }
  }

  console.log(`Finding blog posts...`);
  const posts = findBlogPosts(process.cwd());
  console.log(`Found ${posts.length} posts`);

  // Filter posts that need translation
  const postsToTranslate = posts.filter((post) => {
    // Skip posts that already have the target translation
    if (post.hasTranslation[targetLang]) {
      return false;
    }

    // If missing-only flag, skip posts without an explicit lang tag
    if (missingOnly && !post.lang) {
      return false;
    }

    return true;
  });

  console.log(`\nPosts needing ${targetLang} translation: ${postsToTranslate.length}`);

  if (postsToTranslate.length === 0) {
    console.log('No posts to translate.');
    return;
  }

  // Apply limit if specified
  const postsToProcess = limit > 0 ? postsToTranslate.slice(0, limit) : postsToTranslate;

  console.log(`\nProcessing ${postsToProcess.length} posts...`);
  if (dryRun) {
    console.log('(DRY RUN - no files will be written)\n');
  }

  let success = 0;
  let failed = 0;

  for (const post of postsToProcess) {
    const result = await translatePost(post.path, targetLang, dryRun);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Rate limiting - wait 2 seconds between translations
    if (!dryRun && postsToProcess.indexOf(post) < postsToProcess.length - 1) {
      console.log('Waiting 2 seconds before next translation...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Successful: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
