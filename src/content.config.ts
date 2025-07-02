import { file, glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional().default([]),
      pexelsId: z.number().optional(),
      canonicalUrl: z.string().optional(),
      heroImageMeta: z
        .object({
          author: z.string().optional(),
          prompt: z.string().optional(),
        })
        .optional(),
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
