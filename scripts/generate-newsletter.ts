import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';
import matter from 'gray-matter';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

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
  title: string;
  slug: string;
  description: string;
  pubDate: Date;
  heroImage?: string;
  tags?: string[];
  content: string;
  filePath: string;
}

export interface NewsletterContent {
  month: string;
  year: string;
  summary: string;
  posts: Array<{
    title: string;
    url: string;
    description: string;
    teaser: string;
    image?: string;
    date: string;
  }>;
}

/**
 * Get all blog posts from the last N days that haven't been sent in a newsletter
 */
function processPostDir(postPath: string, postDir: string, cutoffDate: Date, posts: BlogPost[]) {
  const indexPath = join(postPath, 'index.mdx');

  if (!statSync(postPath).isDirectory()) return;

  try {
    const fileContent = readFileSync(indexPath, 'utf-8');
    const { data, content } = matter(fileContent);

    const pubDate = new Date(data.pubDate);

    // Skip if older than cutoff date
    if (pubDate < cutoffDate) return;

    // Skip if already sent in newsletter
    if (data.newsletterSent === true) return;

    // Get excerpt (first 500 characters of content, excluding frontmatter)
    const excerpt = content
      .replace(/^import .+$/gm, '') // Remove imports
      .replace(/^#+ .+$/gm, '') // Remove headings
      .replace(/\n+/g, ' ') // Replace newlines
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
      filePath: indexPath,
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

  // Recursively scan all year directories
  const years = readdirSync(postsDir).filter((dir) => {
    const fullPath = join(postsDir, dir);
    return statSync(fullPath).isDirectory() && /^\d{4}$/.test(dir);
  });

  for (const year of years) {
    const yearDir = join(postsDir, year);
    const postDirs = readdirSync(yearDir);

    for (const postDir of postDirs) {
      const postPath = join(yearDir, postDir);
      processPostDir(postPath, postDir, cutoffDate, posts);
    }
  }

  // Sort by date, newest first
  return posts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/**
 * Generate newsletter content using Gemini AI
 */
export async function generateNewsletterContent(posts: BlogPost[]): Promise<NewsletterContent> {
  if (posts.length === 0) {
    throw new Error('No posts to generate newsletter from');
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      'Missing GOOGLE_GENERATIVE_AI_API_KEY. Ensure it is set in your environment or in a .env file.'
    );
  }

  const model = google('gemini-3-flash-preview');
  const siteUrl = process.env.SITE_URL || 'https://sergiocarracedo.es';

  // Generate monthly summary
  const summaryPrompt = `
You are writing a friendly newsletter introduction for a web development blog. 
Generate a 2-3 sentence summary of this month's blog activity that sounds natural and engaging.

Posts published this month:
${posts.map((p, i) => `${i + 1}. "${p.title}" - ${p.description}`).join('\n')}

Requirements:
- Be conversational and friendly
- Highlight the main themes or topics covered
- Make it sound exciting and worth reading
- Don't use promotional language or exclamation marks excessively
- 2-3 sentences maximum
`;

  const { text: summary } = await generateText({
    model,
    prompt: summaryPrompt,
    maxOutputTokens: 500,
  });

  // Generate teasers for each post
  const postsWithTeasers = await Promise.all(
    posts.map(async (post) => {
      const teaserPrompt = `
Create a compelling 1-2 sentence teaser for this blog post.
Make it intriguing but don't give everything away. Use action-oriented language.

Title: "${post.title}"
Description: "${post.description}"
Excerpt: "${post.content}"

Requirements:
- 1-2 sentences only
- Create curiosity and desire to read more
- Don't summarize, tease!
- Be specific about what the reader will learn or discover
- Don't use clickbait language
`;

      const { text: teaser } = await generateText({
        model,
        prompt: teaserPrompt,
        maxOutputTokens: 450,
      });

      return {
        title: post.title,
        url: `${siteUrl}${post.slug.startsWith('/') ? post.slug : `/${post.slug}`}`,
        description: post.description,
        teaser: teaser.trim(),
        image: post.heroImage ? `${siteUrl}${post.heroImage.startsWith('/') ? post.heroImage : `/${post.heroImage}`}` : undefined,
        date: post.pubDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    })
  );

  const latestDate = posts[0].pubDate;
  const month = latestDate.toLocaleDateString('en-US', { month: 'long' });
  const year = latestDate.getFullYear().toString();

  return {
    month,
    year,
    summary: summary.trim(),
    posts: postsWithTeasers,
  };
}

/**
 * Main function to generate newsletter
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
  });

  console.log('\n🤖 Generating newsletter content with Gemini AI...');

  const content = await generateNewsletterContent(posts);

  console.log('\n✅ Newsletter content generated successfully!');
  console.log(`📅 ${content.month} ${content.year}`);
  console.log(`📝 Summary: ${content.summary}`);
  console.log(`📬 ${content.posts.length} post(s) ready to send`);

  return {
    content,
    posts: posts.map((p) => p.filePath),
  };
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const daysBack = parseInt(process.argv[2] || '30', 10);

  generateNewsletter(daysBack)
    .then((result) => {
      if (result) {
        console.log('\n📄 Newsletter content:');
        console.log(JSON.stringify(result.content, null, 2));
      }
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('❌ Error generating newsletter:', error);
      process.exit(1);
    });
}
