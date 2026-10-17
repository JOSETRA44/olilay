import type { SubmitContactDeps } from '../../application/contact/submitContact';
import { D1ContactRepository, NoopContactRepository, type D1Like } from './D1ContactRepository';
import { ResendNotifier } from './ResendNotifier';

/** Runtime bindings read by the contact feature. Declared in wrangler.jsonc / `.dev.vars`. */
export interface ContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  DB?: D1Like;
}

/**
 * Composition root for the contact feature: picks adapters from what is bound.
 * Binding a D1 database as `DB` enables persistence with no code changes.
 */
export function createContactDeps(env: ContactEnv): SubmitContactDeps {
  return {
    repository: env.DB ? new D1ContactRepository(env.DB) : new NoopContactRepository(),
    notifier: new ResendNotifier({
      apiKey: env.RESEND_API_KEY,
      to: env.CONTACT_TO_EMAIL ?? 'ventas@olilay.com',
      from: env.CONTACT_FROM_EMAIL ?? 'Olilay Web <web@olilay.com>',
    }),
  };
}
