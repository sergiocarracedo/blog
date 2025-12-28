// @ts-check
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkDirective from 'remark-directive';

import emoji from 'remark-emoji';
import imgAttr from 'remark-imgattr';
import './src/middleware';
import { remarkDirectiveASCIInema } from './src/remark-plugins/remark-directive-asciinema';
import { remarkDirectiveAstroEntryRef } from './src/remark-plugins/remark-directive-astro-entry-ref';
import { remarkDirectiveFloatImage } from './src/remark-plugins/remark-directive-float-image';
import { remarkDirectiveIframe } from './src/remark-plugins/remark-directive-iframe';
import { remarkDirectiveSpotify } from './src/remark-plugins/remark-directive-spotify';
import { remarkDirectiveYoutube } from './src/remark-plugins/remark-directive-youtube';

import icon from 'astro-icon';

import pagefind from 'astro-pagefind';

import cookieconsent from '@jop-software/astro-cookieconsent';
import { cookieConsentConfig } from './cookieConsentConfig';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://sergiocarracedo.es',
  integrations: [mdx(), sitemap(), icon(), pagefind(), cookieconsent(cookieConsentConfig), react()],
  image: {
    // Enable image optimization
    domains: ['sergiocarracedo.es'],
    remotePatterns: [{ protocol: 'https' }],
  },
  markdown: {
    remarkPlugins: [
      [remarkDirective, {}],
      [remarkDirectiveYoutube, {}],
      [remarkDirectiveAstroEntryRef, {}],
      [remarkDirectiveSpotify, {}],
      [remarkDirectiveIframe, {}],
      [remarkDirectiveASCIInema, {}],
      [remarkDirectiveFloatImage, {}],
      [emoji, {}],
      [imgAttr, {}],
    ],
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',

          headingProperties: {
            className: ['anchor'],
          },
          properties: {
            className: ['anchor-link'],
          },
        },
      ],
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [tailwindcss()],
  },
});
