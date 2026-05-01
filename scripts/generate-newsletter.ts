import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
import matter from 'gray-matter';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import sharp from 'sharp';

function loadEnv() {
  const cwd = process.cwd();
  const mode = process.env.NODE_ENV || 'development';

  const envFiles = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];

  for (const file of envFiles) {
    const envPath = resolve(cwd, file);
    if (!existsSync(envPath)) continue;
    dotenv.config({ path: envPath, override: false });
  }
}

loadEnv();

export interface BlogPost {
  /** Title from the EN (canonical) file */
  title: string;
  /** Slug used for URL construction */
  slug: string;
  /** Description from the EN file */
  description: string;
  pubDate: Date;
  heroImage?: string;
  tags?: string[];
  /** Excerpt from the EN file content */
  content: string;
  /** Absolute path to the post directory */
  postPath: string;
  /** e.g. "2025/post-slug" — used for image URL construction */
  fullBlogPath?: string;
  /** Path to the canonical EN file (index.en.mdx or index.en.t.mdx) */
  enFile: string | null;
  /** Path to the ES file (index.es.mdx or index.es.t.mdx) */
  esFile: string | null;
}

export interface NewsletterPost {
  title: string;
  url: string;
  description: string;
  teaser: string;
  image?: string;
  date: string;
}

export interface NewsletterContent {
  month: string;
  year: string;
  summary: string;
  posts: NewsletterPost[];
}

function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return (
    error.message.includes('Resource exhausted') ||
    error.message.includes('statusCode: 429') ||
    error.message.includes('429')
  );
}

function withTrailingPunctuation(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function buildFallbackSummary(
  posts: Array<{ title: string; description: string }>,
  locale: 'en' | 'es'
): string {
  if (locale === 'es') {
    if (posts.length === 1) {
      return `Este mes he publicado una nueva entrada: ${posts[0].title}.`;
    }

    return `Este mes he publicado ${posts.length} nuevas entradas: ${posts
      .map((post) => post.title)
      .join(', ')}.`;
  }

  if (posts.length === 1) {
    return `This month I published one new post: ${posts[0].title}.`;
  }

  return `This month I published ${posts.length} new posts: ${posts
    .map((post) => post.title)
    .join(', ')}.`;
}

function buildFallbackTeaser(
  post: { title: string; description: string; content: string },
  locale: 'en' | 'es'
): string {
  const baseText = withTrailingPunctuation(post.description || post.content || post.title);

  if (baseText.length <= 160) return baseText;

  const truncated = baseText.slice(0, 157).trimEnd();
  return locale === 'es' ? `${truncated}...` : `${truncated}...`;
}

/**
 * Given a post directory, find the best candidate file for a given locale.
 * Priority: index.{locale}.mdx > index.{locale}.t.mdx
 * Returns null if neither exists.
 */
function findLocaleFile(postPath: string, locale: 'en' | 'es'): string | null {
  const candidates = [
    join(postPath, `index.${locale}.mdx`),
    join(postPath, `index.${locale}.t.mdx`),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

/**
 * Scan a post directory and push a BlogPost entry if the post is new enough
 * and has not been sent yet (no .newsletter.lock file present).
 */
function processPostDir(
  postPath: string,
  postDir: string,
  year: string,
  cutoffDate: Date,
  posts: BlogPost[]
) {
  if (!statSync(postPath).isDirectory()) return;

  // Skip if already sent
  if (existsSync(join(postPath, '.newsletter.lock'))) return;

  const enFile = findLocaleFile(postPath, 'en');
  const esFile = findLocaleFile(postPath, 'es');

  // Need at least the EN file to include the post (it's the canonical source)
  if (!enFile) {
    // Fallback: try legacy index.mdx
    const legacyPath = join(postPath, 'index.mdx');
    if (!existsSync(legacyPath)) return;
    // Treat the legacy file as EN
    try {
      const fileContent = readFileSync(legacyPath, 'utf-8');
      const { data, content } = matter(fileContent);
      const pubDate = new Date(data.pubDate);
      if (pubDate < cutoffDate) return;

      const excerpt = content
        .replace(/^import .+$/gm, '')
        .replace(/^#+ .+$/gm, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 500);

      posts.push({
        title: data.title,
        slug: data.slug || `/blog/${postDir}`,
        description: data.description || excerpt,
        pubDate,
        heroImage: data.heroImage,
        tags: data.tags || [],
        content: excerpt,
        postPath,
        fullBlogPath: `${year}/${postDir}`,
        enFile: legacyPath,
        esFile,
      });
    } catch (error: unknown) {
      console.error(`Error reading legacy post ${postDir}:`, error);
    }
    return;
  }

  try {
    const fileContent = readFileSync(enFile, 'utf-8');
    const { data, content } = matter(fileContent);

    const pubDate = new Date(data.pubDate);
    if (pubDate < cutoffDate) return;

    const excerpt = content
      .replace(/^import .+$/gm, '')
      .replace(/^#+ .+$/gm, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 500);

    posts.push({
      title: data.title,
      slug: data.slug || `/blog/${postDir}`,
      description: data.description || excerpt,
      pubDate,
      heroImage: data.heroImage,
      tags: data.tags || [],
      content: excerpt,
      postPath,
      fullBlogPath: `${year}/${postDir}`,
      enFile,
      esFile,
    });
  } catch (error: unknown) {
    console.error(`Error reading post ${postDir}:`, error);
  }
}

export function getRecentPosts(daysBack = 30): BlogPost[] {
  const postsDir = join(process.cwd(), 'src', 'content', 'blog');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const posts: BlogPost[] = [];

  const years = readdirSync(postsDir).filter((dir) => {
    const fullPath = join(postsDir, dir);
    return statSync(fullPath).isDirectory() && /^\d{4}$/.test(dir);
  });

  for (const year of years) {
    const yearDir = join(postsDir, year);
    const postDirs = readdirSync(yearDir);

    for (const postDir of postDirs) {
      const postPath = join(yearDir, postDir);
      processPostDir(postPath, postDir, year, cutoffDate, posts);
    }
  }

  return posts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/**
 * Optimise the hero image of a post for email use.
 * Returns the absolute URL to the optimised image, or undefined.
 */
async function optimiseHeroImage(post: BlogPost, siteUrl: string): Promise<string | undefined> {
  if (!post.heroImage) return undefined;

  if (post.heroImage.startsWith('http')) return post.heroImage;

  const filename = post.heroImage.replace('./', '');
  // Resolve relative to the canonical (EN) file's directory
  const sourceDir = dirname(post.enFile || join(post.postPath, 'index.en.mdx'));
  const sourcePath = join(sourceDir, filename);

  if (!existsSync(sourcePath)) {
    console.warn(`⚠️  Image not found: ${sourcePath}`);
    return undefined;
  }

  const destDir = join(process.cwd(), 'public', 'newsletter-images', post.fullBlogPath || '');
  mkdirSync(destDir, { recursive: true });

  const outputFilename = `${basename(filename, extname(filename))}.jpg`;
  const destPath = join(destDir, outputFilename);

  if (existsSync(destPath)) {
    console.log(`⏭️  Image already exists: ${outputFilename}`);
  } else {
    await sharp(sourcePath)
      .resize(300, 150, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toFile(destPath);
    console.log(`✅ Optimized image: ${filename} -> ${outputFilename} (300x150)`);
  }

  return `${siteUrl}/newsletter-images/${post.fullBlogPath}/${outputFilename}`;
}

/**
 * Generate newsletter content for a specific locale using Gemini AI.
 * For each post the ES file is used when locale='es' if available;
 * otherwise falls back to the EN file with a "respond in Spanish" instruction.
 */
export async function generateNewsletterContent(
  posts: BlogPost[],
  locale: 'en' | 'es' = 'en'
): Promise<NewsletterContent> {
  if (posts.length === 0) {
    throw new Error('No posts to generate newsletter from');
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      'Missing GOOGLE_GENERATIVE_AI_API_KEY. Ensure it is set in your environment or in a .env file.'
    );
  }

  const model = google('gemini-2.0-flash');
  const siteUrl = process.env.SITE_URL || 'https://sergiocarracedo.es';
  const langInstruction =
    locale === 'es' ? 'Write your response in Spanish.' : 'Write your response in English.';
  const dateLocale = locale === 'es' ? 'es-ES' : 'en-US';

  // Read post data in the target locale
  const localePosts = posts.map((post) => {
    const targetFile = locale === 'es' ? (post.esFile ?? post.enFile) : post.enFile;
    if (!targetFile)
      return { title: post.title, description: post.description, content: post.content };

    try {
      const fileContent = readFileSync(targetFile, 'utf-8');
      const { data, content } = matter(fileContent);
      const excerpt = content
        .replace(/^import .+$/gm, '')
        .replace(/^#+ .+$/gm, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 500);
      return {
        title: data.title || post.title,
        description: data.description || post.description,
        content: excerpt,
      };
    } catch {
      return { title: post.title, description: post.description, content: post.content };
    }
  });

  // Generate monthly intro summary
  const summaryPrompt = `
You are writing a friendly newsletter introduction for a web development blog.
Generate a 2-3 sentence summary of this month's blog activity that sounds natural and engaging.
${langInstruction}

Posts published this month:
${localePosts.map((p, i) => `${i + 1}. "${p.title}" - ${p.description}`).join('\n')}

Requirements:
- Be conversational and friendly
- Highlight the main themes or topics covered
- Make it sound exciting and worth reading
- Don't use promotional language or exclamation marks excessively
- 2-3 sentences maximum
`;

  let summary: string;

  try {
    ({ text: summary } = await generateText({ model, prompt: summaryPrompt }));
  } catch (error: unknown) {
    if (!isRateLimitError(error)) throw error;

    console.warn(`⚠️  Gemini rate limit hit while generating ${locale.toUpperCase()} summary.`);
    summary = buildFallbackSummary(localePosts, locale);
  }

  // Generate teasers sequentially to avoid hitting provider rate limits.
  const postsWithTeasers: NewsletterPost[] = [];

  for (const [i, post] of posts.entries()) {
    const lp = localePosts[i];

    const teaserPrompt = `
Create a compelling 1-2 sentence teaser for this blog post.
Make it intriguing but don't give everything away. Use action-oriented language.
${langInstruction}

Title: "${lp.title}"
Description: "${lp.description}"
Excerpt: "${lp.content}"

Requirements:
- 1-2 sentences only
- Create curiosity and desire to read more
- Don't summarize, tease!
- Be specific about what the reader will learn or discover
- Don't use clickbait language
`;

    const imageUrl = await optimiseHeroImage(post, siteUrl);

    let teaser: string;

    try {
      ({ text: teaser } = await generateText({ model, prompt: teaserPrompt }));
    } catch (error: unknown) {
      if (!isRateLimitError(error)) throw error;

      console.warn(`⚠️  Gemini rate limit hit while generating teaser for "${lp.title}".`);
      teaser = buildFallbackTeaser(lp, locale);
    }

    // Build the post URL: EN at /{slug}, ES at /es/{slug}
    const slugPath = post.slug.startsWith('/') ? post.slug : `/${post.slug}`;
    const url = locale === 'es' ? `${siteUrl}/es${slugPath}` : `${siteUrl}${slugPath}`;

    postsWithTeasers.push({
      title: lp.title,
      url,
      description: lp.description,
      teaser: teaser.trim(),
      image: imageUrl,
      date: post.pubDate.toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  }

  const latestDate = posts[0].pubDate;
  const month = latestDate.toLocaleDateString(dateLocale, { month: 'long' });
  const year = latestDate.getFullYear().toString();

  return {
    month,
    year,
    summary: summary.trim(),
    posts: postsWithTeasers,
  };
}

/**
 * Main entry point: scan posts and generate both EN and ES newsletter content.
 */
export async function generateNewsletter(daysBack = 30) {
  console.log(`🔍 Searching for posts from the last ${daysBack} days...`);

  const posts = getRecentPosts(daysBack);

  if (posts.length === 0) {
    console.log('📭 No new posts found. Skipping newsletter.');
    return null;
  }

  console.log(`📝 Found ${posts.length} post(s) to include:`);
  posts.forEach((post) => {
    console.log(`  - ${post.title} (${post.pubDate.toISOString().split('T')[0]})`);
    console.log(`    EN: ${post.enFile ?? 'none'}`);
    console.log(`    ES: ${post.esFile ?? 'none'}`);
  });

  console.log('\n🤖 Generating EN newsletter content with Gemini AI...');
  const contentEn = await generateNewsletterContent(posts, 'en');

  console.log('\n🤖 Generating ES newsletter content with Gemini AI...');
  const contentEs = await generateNewsletterContent(posts, 'es');

  console.log('\n✅ Newsletter content generated successfully!');
  console.log(`📅 ${contentEn.month} ${contentEn.year}`);
  console.log(`📝 EN summary: ${contentEn.summary}`);
  console.log(`📝 ES summary: ${contentEs.summary}`);
  console.log(`📬 ${contentEn.posts.length} post(s) ready to send`);

  return {
    contentEn,
    contentEs,
    // Folder paths — used to write .newsletter.lock files after sending
    posts: posts.map((p) => p.postPath),
  };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const daysBack = parseInt(process.argv[2] || '30', 10);

  generateNewsletter(daysBack)
    .then((result) => {
      if (result) {
        console.log('\n📄 EN Newsletter content:');
        console.log(JSON.stringify(result.contentEn, null, 2));
        console.log('\n📄 ES Newsletter content:');
        console.log(JSON.stringify(result.contentEs, null, 2));
      }
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('❌ Error generating newsletter:', error);
      process.exit(1);
    });
}
