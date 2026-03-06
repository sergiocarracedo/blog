import { file, glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  // Custom generateId: for co-located translation files (index.es.mdx, index.en.mdx),
  // always use the path-based ID (ignoring frontmatter `slug`) to avoid ID collisions
  // with the base post that shares the same `slug` value.
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry, base, data }) => {
      // Check if this is a translation file by its filename pattern
      if (/\/index\.(en|es)\.(md|mdx)$/.test(entry)) {
        // Strip the base path prefix and file extension to get a path-based ID
        // e.g. "2026/2026-01-31-mac-mierda/index.es.mdx" → "2026/2026-01-31-mac-mierda/index.es"
        const relativePath = entry.replace(/\.(md|mdx)$/, '');
        return relativePath;
      }
      // Default: use frontmatter slug if present, otherwise path-based
      if (data.slug) {
        return data.slug as string;
      }
      // Path-based ID (strip extension, collapse /index at end)
      const withoutExt = entry.replace(/\.(md|mdx)$/, '');
      return withoutExt.replace(/\/index$/, '');
    },
  }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      excerpt: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroVideo: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      pexelsId: z.number().optional(),
      canonicalUrl: z.string().optional(),
      heroImageMeta: z
        .object({
          author: z.string().optional(),
          prompt: z.string().optional(),
          source: z.string().optional(),
          licence: z.string().optional(),
        })
        .optional(),
      aiGenerated: z.boolean().optional().default(false),
      // slug is used by generateId for base posts; also mirrored on translation files
      // so that getSlug() can recover the correct URL without a base-post lookup
      slug: z.string().optional(),
      // i18n fields
      lang: z.enum(['en', 'es']).optional(), // Original language of the post
      autoTranslated: z.boolean().optional().default(false), // Flag for AI-translated content
      originalLang: z.enum(['en', 'es']).optional(), // Original language if this is a translation
    }),
});

const skills = defineCollection({
  // Load Markdown files in the `src/content/skills/` directory.
  loader: file('./src/content/skills/skills.json'),
  // Type-check frontmatter using a schema
  schema: () =>
    z.object({
      name: z.string(),
      color: z.string().optional(),
      textColor: z.string().optional(),
      icon: z.string().optional(),
    }),
});

export const collections = { blog, skills };
