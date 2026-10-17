import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Entries live in `<collection>/<locale>/<key>.md`, so ids look like `es/web`.
 * The `key` is shared between locales and links translations together.
 * To move this content to a CMS or database later, swap the `glob` loader for
 * a custom loader that returns the same schema — pages don't need to change.
 */

// Ids always come from the file path (`es/unicali`): without this, glob would use the `slug`
// frontmatter field as id and both locales of a product would collide.
const idFromPath = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

const products = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/products', generateId: idFromPath }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    summary: z.string(),
    category: z.string(),
    status: z.enum(['available', 'beta', 'development']),
    url: z.url(),
    platforms: z.array(z.string()),
    features: z.array(z.object({ title: z.string(), body: z.string(), beta: z.boolean().default(false) })),
    order: z.number().default(0),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/services', generateId: idFromPath }),
  schema: z.object({
    key: z.enum(['web', 'mobile', 'custom', 'automation', 'ai', 'consulting']),
    title: z.string(),
    summary: z.string(),
    forWhom: z.string(),
    includes: z.array(z.string()),
    order: z.number(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/legal', generateId: idFromPath }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date(),
  }),
});

export const collections = { products, services, legal };
