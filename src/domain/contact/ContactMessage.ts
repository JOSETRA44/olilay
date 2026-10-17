import { z } from 'zod';

export const contactTopics = ['product', 'web', 'mobile', 'custom', 'automation', 'ai', 'consulting', 'other'] as const;
export type ContactTopic = (typeof contactTopics)[number];

/** Validation rules for an inbound contact request. Error codes are keys of `contact.errors` in the UI dictionary. */
export const contactInputSchema = z.object({
  name: z.string().trim().min(2, { error: 'name' }).max(100, { error: 'name' }),
  email: z.email({ error: 'email' }).trim().max(254, { error: 'email' }),
  organization: z
    .string()
    .trim()
    .max(120, { error: 'organization' })
    .optional()
    .transform((v) => (v ? v : undefined)),
  topic: z.enum(contactTopics, { error: 'topic' }),
  message: z.string().trim().min(20, { error: 'message' }).max(5000, { error: 'message' }),
  consent: z.literal(true, { error: 'consent' }),
  locale: z.enum(['es', 'en']).default('es'),
});

export type ContactInput = z.infer<typeof contactInputSchema>;
export type ContactField = 'name' | 'email' | 'organization' | 'topic' | 'message' | 'consent';

/** A validated message, ready to be persisted and delivered. */
export interface ContactMessage extends ContactInput {
  id: string;
  receivedAt: Date;
}
