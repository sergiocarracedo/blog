#!/usr/bin/env tsx

/**
 * Translate Post Script
 *
 * Translates a blog post from one language to another using AI SDK.
 *
 * Usage:
 *   pnpm translate --file src/content/blog/2024/my-post/index.mdx --to es
 *   pnpm translate --file src/content/blog/2024/my-post/index.mdx --to en
 *
 * Environment Variables:
 *   AI_PROVIDER: 'openai' | 'anthropic' | 'google' (default: 'openai')
 *   OPENAI_API_KEY: OpenAI API key
 *   ANTHROPIC_API_KEY: Anthropic API key
 *   GOOGLE_GENERATIVE_AI_API_KEY: Google AI API key
 */

import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import * as fs from 'node:fs';
import * as path from 'node:path';

type Locale = 'en' | 'es';
type Provider = 'openai' | 'anthropic' | 'google';

interface TranslationOptions {
  filePath: string;
  targetLang: Locale;
  provider?: Provider;
  dryRun?: boolean;
}

type FrontmatterData = Record<string, unknown>;

/**
 * Parse MDX file into frontmatter and content
 */
function parseMdx(content: string): { frontmatter: string; body: string; data: FrontmatterData } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = frontmatterRegex.exec(content);

  if (!match) {
    throw new Error('Invalid MDX file: missing frontmatter');
  }

  const frontmatter = match[1];
  const body = match[2];

  // Parse YAML frontmatter (simple parser)
  const data: FrontmatterData = {};
  const lines = frontmatter.split('\n');
  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    if (/^\s+-\s+/.exec(line)) {
      // Array item
      const value = line.replace(/^\s+-\s+/, '').replace(/^['"]|['"]$/g, '');
      arrayValues.push(value);
    } else if (/^(\w+):\s*$/.exec(line)) {
      // Key with no value (start of array or object)
      if (currentKey && inArray) {
        data[currentKey] = arrayValues;
        arrayValues = [];
      }
      currentKey = line.replace(':', '').trim();
      inArray = true;
    } else if (/^(\w+):\s*.+$/.exec(line)) {
      // Key-value pair
      if (currentKey && inArray) {
        data[currentKey] = arrayValues;
        arrayValues = [];
        inArray = false;
      }
      const [key, ...rest] = line.split(':');
      const value = rest
        .join(':')
        .trim()
        .replace(/^['"]|['"]$/g, '');
      data[key.trim()] = value;
      currentKey = key.trim();
    }
  }

  // Handle last array
  if (currentKey && inArray && arrayValues.length > 0) {
    data[currentKey] = arrayValues;
  }

  return { frontmatter, body, data };
}

/**
 * Build frontmatter string from data
 */
function buildFrontmatter(data: FrontmatterData): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`${key}:`);
      for (const [subKey, subValue] of Object.entries(value)) {
        lines.push(`  ${subKey}: ${subValue}`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Get the AI model based on provider
 */
function getModel(provider: Provider | (string & {})) {
  switch (provider) {
    case 'openai':
      return openai('gpt-5');
    case 'anthropic':
      return anthropic('claude-sonnet-4-6');
    case 'google':
      return google('gemini-3-flash-preview');
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Get language name for display
 */
function getLanguageName(lang: Locale, inLang: Locale): string {
  const names: Record<Locale, Record<Locale, string>> = {
    en: { en: 'English', es: 'Spanish' },
    es: { en: 'ingles', es: 'espanol' },
  };
  return names[inLang][lang];
}

/**
 * Translate the content using AI
 */
async function translateContent(
  content: string,
  sourceLang: Locale,
  targetLang: Locale,
  provider: Provider
): Promise<string> {
  const model = getModel(provider);

  const prompt = `You are a professional translator specializing in technical blog posts about software development.

Translate the following blog post content from ${getLanguageName(sourceLang, 'en')} to ${getLanguageName(targetLang, 'en')}.

IMPORTANT RULES:
1. Preserve ALL Markdown/MDX syntax exactly as-is (headings, links, images, code blocks, etc.)
2. Keep ALL code blocks completely unchanged - do not translate code or comments inside code blocks
3. Keep ALL HTML tags and attributes unchanged
4. Keep ALL MDX components and their attributes unchanged (e.g., <YouTube id="..." />, ::youtube{...})
5. Preserve all link URLs exactly as-is
6. Keep technical terms and proper nouns (library names, tool names, etc.) in their original form
7. Translate naturally, maintaining the author's voice and tone
8. Preserve paragraph structure and formatting
9. Keep all frontmatter field names in English (title, description, etc.)
10. For the title field, translate it naturally

Content to translate:
---
${content}
---

Return ONLY the translated content, nothing else.`;

  const { text } = await generateText({
    model,
    prompt,
    maxTokens: 8000,
    temperature: 0.3,
  });

  return text.trim();
}

/**
 * Main translation function
 */
async function translatePost(options: TranslationOptions): Promise<void> {
  const { filePath, targetLang, provider = 'openai', dryRun = false } = options;

  // Validate file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Read the file
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body, data } = parseMdx(content);

  // Detect source language from filename suffix first (index.es.mdx → es),
  // falling back to the frontmatter `lang` field, then defaulting to 'en'.
  const fileBaseName = path.basename(filePath, path.extname(filePath)); // e.g. "index.es"
  const fileLangMatch = fileBaseName.match(/\.([a-z]{2})(?:\.t)?$/);
  const sourceLang: Locale = (fileLangMatch?.[1] as Locale) ?? (data.lang as Locale) ?? 'en';

  if (sourceLang === targetLang) {
    console.log(`Post is already in ${targetLang}, skipping.`);
    return;
  }

  console.log(`Translating from ${sourceLang} to ${targetLang}...`);
  console.log(`Using provider: ${provider}`);

  // Prepare content for translation (title + description + body)
  const toTranslate = `title: ${data.title}\ndescription: ${data.description || ''}\nexcerpt: ${data.excerpt || ''}\n\n${body}`;

  // Translate
  const translated = await translateContent(toTranslate, sourceLang, targetLang, provider);

  // Parse translated content back
  const titleMatch = /^title:\s*(.+)$/m.exec(translated);
  const descMatch = /^description:\s*(.+)$/m.exec(translated);
  const excerptMatch = /^excerpt:\s*(.+)$/m.exec(translated);

  const translatedTitle = titleMatch ? titleMatch[1].trim() : data.title;
  const translatedDesc = descMatch ? descMatch[1].trim() : data.description;
  const translatedExcerpt = excerptMatch ? excerptMatch[1].trim() : data.excerpt;

  // Remove the frontmatter-like lines from the beginning
  const translatedBody = translated
    .replace(/^title:\s*.+$/m, '')
    .replace(/^description:\s*.+$/m, '')
    .replace(/^excerpt:\s*.+$/m, '')
    .trim();

  // Build new frontmatter — drop `lang` (filename suffix is the source of truth now)
  const { lang: _lang, ...dataWithoutLang } = data as FrontmatterData & { lang?: unknown };
  const newData: FrontmatterData = {
    ...dataWithoutLang,
    title: translatedTitle,
    description: translatedDesc,
    excerpt: translatedExcerpt,
    autoTranslated: true,
    originalLang: sourceLang,
  };

  // Build new MDX content
  const newFrontmatter = buildFrontmatter(newData);
  const newContent = `---\n${newFrontmatter}\n---\n\n${translatedBody}`;

  // Determine output path.
  // Convention:
  //   index.en.mdx  (EN original)   → translated ES → index.es.t.mdx
  //   index.es.mdx  (ES original)   → translated EN → index.en.t.mdx
  //   index.mdx     (legacy EN)     → translated ES → index.es.t.mdx  (treated as EN original)
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath); // ".mdx"
  const base = path.basename(filePath, ext); // e.g. "index.es" or "index"

  // Strip any existing lang/translation suffix to get the bare base ("index")
  const bareBase = base.replace(/\.[a-z]{2}(\.t)?$/, '');

  const outputFileName = `${bareBase}.${targetLang}.t${ext}`; // e.g. index.en.t.mdx
  const outputPath = path.join(dir, outputFileName);

  if (dryRun) {
    console.log('\n--- DRY RUN ---');
    console.log(`Would write to: ${outputPath}`);
    console.log('\n--- Content Preview ---');
    console.log(newContent.substring(0, 500) + '...');
  } else {
    fs.writeFileSync(outputPath, newContent, 'utf-8');
    console.log(`\nTranslation saved to: ${outputPath}`);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  let filePath = '';
  let targetLang: Locale = 'es';
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' || args[i] === '-f') {
      filePath = args[++i];
    } else if (args[i] === '--to' || args[i] === '-t') {
      targetLang = args[++i] as Locale;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  if (!filePath) {
    console.error('Usage: pnpm translate --file <path> --to <lang>');
    console.error('  --file, -f  Path to the MDX file to translate');
    console.error('  --to, -t    Target language (en or es)');
    console.error('  --dry-run   Preview without writing');
    process.exit(1);
  }

  const provider = (process.env.AI_PROVIDER as Provider) || 'openai';

  try {
    await translatePost({ filePath, targetLang, provider, dryRun });
    console.log('Done!');
  } catch (error) {
    console.error('Translation failed:', error);
    process.exit(1);
  }
}

main();
