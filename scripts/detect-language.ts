#!/usr/bin/env tsx

/**
 * Detect Language Script
 *
 * Analyzes blog posts without a `lang` field and detects their language.
 * Can optionally update the frontmatter with the detected language.
 *
 * Usage:
 *   pnpm detect-lang           # Analyze and report
 *   pnpm detect-lang --update  # Update frontmatter with detected language
 *   pnpm detect-lang --ai      # Use AI for detection (more accurate)
 */

import * as fs from 'fs';
import * as path from 'path';

type Locale = 'en' | 'es';

interface DetectionResult {
  path: string;
  title: string;
  detectedLang: Locale | 'unknown';
  confidence: number;
  method: 'heuristics' | 'ai';
}

// Common Spanish words
const SPANISH_WORDS = new Set([
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'de',
  'del',
  'al',
  'en',
  'con',
  'por',
  'para',
  'sin',
  'que',
  'qué',
  'como',
  'cómo',
  'cuando',
  'cuándo',
  'pero',
  'porque',
  'aunque',
  'mientras',
  'donde',
  'dónde',
  'este',
  'esta',
  'estos',
  'estas',
  'ese',
  'esa',
  'esos',
  'esas',
  'mi',
  'tu',
  'su',
  'mis',
  'tus',
  'sus',
  'ser',
  'estar',
  'tener',
  'hacer',
  'poder',
  'decir',
  'es',
  'son',
  'está',
  'están',
  'hay',
  'muy',
  'más',
  'menos',
  'también',
  'además',
  'sobre',
  'entre',
  'hasta',
  'desde',
  'hacia',
  'si',
  'no',
  'sí',
  'ya',
  'ahora',
  'siempre',
  'nunca',
  'todo',
  'todos',
  'toda',
  'todas',
  'algo',
  'nada',
  'otro',
  'otra',
  'otros',
  'otras',
  'puede',
  'pueden',
  'podemos',
  'vamos',
  'hace',
  'cada',
  'cual',
  'cuál',
  'quien',
  'quién',
]);

// Common English words
const ENGLISH_WORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'can',
  'may',
  'might',
  'of',
  'in',
  'to',
  'for',
  'with',
  'on',
  'at',
  'by',
  'from',
  'that',
  'this',
  'these',
  'those',
  'it',
  'its',
  'and',
  'or',
  'but',
  'if',
  'then',
  'else',
  'when',
  'where',
  'what',
  'which',
  'who',
  'how',
  'why',
  'not',
  'no',
  'yes',
  'all',
  'some',
  'any',
  'each',
  'every',
  'more',
  'most',
  'less',
  'least',
  'very',
  'much',
  'many',
  'also',
  'just',
  'only',
  'even',
  'still',
  'already',
  'about',
  'into',
  'through',
  'between',
  'without',
  'within',
  'there',
  'here',
  'where',
  'now',
  'then',
  'always',
  'never',
  'other',
  'another',
  'same',
  'different',
  'new',
  'old',
  'first',
  'last',
  'next',
  'good',
  'bad',
  'you',
  'your',
  'we',
  'our',
  'they',
  'their',
  'my',
  'me',
]);

// Spanish-specific characters
const SPANISH_CHARS_REGEX = /[áéíóúüñ¿¡]/gi;

/**
 * Detect language using heuristics
 */
function detectLanguageHeuristics(text: string): { lang: Locale | 'unknown'; confidence: number } {
  // Normalize and clean text
  const cleanText = text
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/[^a-záéíóúüñ\s]/gi, ' '); // Keep only letters and spaces

  const words = cleanText.split(/\s+/).filter((w) => w.length > 1);

  // Count Spanish-specific characters
  const spanishChars = (text.match(SPANISH_CHARS_REGEX) || []).length;

  // Count word matches
  let spanishCount = 0;
  let englishCount = 0;

  for (const word of words) {
    if (SPANISH_WORDS.has(word)) spanishCount++;
    if (ENGLISH_WORDS.has(word)) englishCount++;
  }

  // Calculate scores
  const spanishScore = spanishCount + spanishChars * 2;
  const englishScore = englishCount;
  const total = spanishScore + englishScore;

  if (total === 0) {
    return { lang: 'unknown', confidence: 0 };
  }

  const spanishRatio = spanishScore / total;
  const englishRatio = englishScore / total;

  // Strong Spanish indicators
  if (spanishChars > 5 || spanishRatio > 0.6) {
    return { lang: 'es', confidence: Math.min(0.95, 0.5 + spanishRatio * 0.5) };
  }

  // Strong English indicators
  if (englishRatio > 0.6) {
    return { lang: 'en', confidence: Math.min(0.95, 0.5 + englishRatio * 0.5) };
  }

  // Close call - use Spanish chars as tiebreaker
  if (spanishChars > 0) {
    return { lang: 'es', confidence: 0.6 };
  }

  // Default to English
  return { lang: 'en', confidence: 0.5 + (englishRatio - spanishRatio) * 0.3 };
}

/**
 * Parse frontmatter from MDX
 */
function parseFrontmatter(content: string): {
  frontmatter: string;
  body: string;
  data: Record<string, unknown>;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error('Invalid MDX: missing frontmatter');
  }

  const frontmatter = match[1];
  const body = match[2];

  // Simple YAML parsing
  const data: Record<string, unknown> = {};
  for (const line of frontmatter.split('\n')) {
    const keyValueMatch = line.match(/^(\w+):\s*(.+)$/);
    if (keyValueMatch) {
      data[keyValueMatch[1]] = keyValueMatch[2].replace(/^['"]|['"]$/g, '');
    }
  }

  return { frontmatter, body, data };
}

/**
 * Update frontmatter with lang field
 */
function updateFrontmatter(content: string, lang: Locale): string {
  // Add lang field after title
  return content.replace(/^(---\n[\s\S]*?)(title:\s*.+\n)/m, `$1$2lang: ${lang}\n`);
}

/**
 * Find posts without lang field
 */
function findPostsWithoutLang(dir: string): string[] {
  const posts: string[] = [];
  const blogDir = path.join(dir, 'src/content/blog');

  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (
        (entry.name === 'index.mdx' || entry.name === 'index.md') &&
        !entry.name.includes('.en.') &&
        !entry.name.includes('.es.')
      ) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Check if lang field exists
        if (!content.match(/^lang:\s*\w+/m)) {
          posts.push(fullPath);
        }
      }
    }
  }

  scanDir(blogDir);
  return posts;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const updateFiles = args.includes('--update');
  const useAI = args.includes('--ai');

  if (useAI) {
    console.log('AI detection not implemented yet. Using heuristics.\n');
  }

  console.log('Finding posts without lang field...\n');
  const posts = findPostsWithoutLang(process.cwd());

  if (posts.length === 0) {
    console.log('All posts already have lang field.');
    return;
  }

  console.log(`Found ${posts.length} posts without lang field.\n`);

  const results: DetectionResult[] = [];

  for (const postPath of posts) {
    const content = fs.readFileSync(postPath, 'utf-8');
    const { data, body } = parseFrontmatter(content);
    const title = (data.title as string) || 'Unknown';

    // Combine title and body for detection
    const textToAnalyze = `${title}\n${body}`;
    const { lang, confidence } = detectLanguageHeuristics(textToAnalyze);

    results.push({
      path: postPath,
      title: title.substring(0, 50),
      detectedLang: lang,
      confidence,
      method: 'heuristics',
    });

    // Update file if requested
    if (updateFiles && lang !== 'unknown') {
      const updatedContent = updateFrontmatter(content, lang);
      fs.writeFileSync(postPath, updatedContent, 'utf-8');
    }
  }

  // Print results
  console.log('Results:\n');
  console.log('| Language | Confidence | Title |');
  console.log('|----------|------------|-------|');

  for (const result of results) {
    const conf = (result.confidence * 100).toFixed(0) + '%';
    const title = result.title.length > 40 ? result.title.substring(0, 40) + '...' : result.title;
    console.log(`| ${result.detectedLang.padEnd(8)} | ${conf.padEnd(10)} | ${title} |`);
  }

  // Summary
  const byLang = {
    en: results.filter((r) => r.detectedLang === 'en').length,
    es: results.filter((r) => r.detectedLang === 'es').length,
    unknown: results.filter((r) => r.detectedLang === 'unknown').length,
  };

  console.log('\n--- Summary ---');
  console.log(`English: ${byLang.en}`);
  console.log(`Spanish: ${byLang.es}`);
  console.log(`Unknown: ${byLang.unknown}`);

  if (updateFiles) {
    console.log('\nFiles updated with detected language.');
  } else {
    console.log('\nRun with --update to add lang field to frontmatter.');
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
