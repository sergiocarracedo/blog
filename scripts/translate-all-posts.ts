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
 * Find all blog posts
 */
function findBlogPosts(dir: string): PostInfo[] {
  const posts: PostInfo[] = [];
  const blogDir = path.join(dir, 'src/content/blog');

  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name === 'index.mdx' || entry.name === 'index.md') {
        // Found a base post (not a co-located translation file)
        const content = fs.readFileSync(fullPath, 'utf-8');
        const langMatch = content.match(/^lang:\s*(\w+)/m);
        const lang = langMatch ? (langMatch[1] as Locale) : undefined;

        // Check for co-located translations (index.es.mdx / index.en.mdx siblings)
        const dir = path.dirname(fullPath);
        const hasEn =
          fs.existsSync(path.join(dir, 'index.en.mdx')) ||
          fs.existsSync(path.join(dir, 'index.en.md')) ||
          lang === 'en';
        const hasEs =
          fs.existsSync(path.join(dir, 'index.es.mdx')) ||
          fs.existsSync(path.join(dir, 'index.es.md')) ||
          lang === 'es';

        posts.push({
          path: fullPath,
          lang,
          hasTranslation: { en: hasEn, es: hasEs },
        });
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

    // Skip posts that are co-located translation files themselves (index.es.mdx etc.)
    if (/\/index\.(en|es)\.(mdx?|md)$/.test(post.path)) {
      return false;
    }

    // If missing-only flag, skip posts without explicit lang
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
