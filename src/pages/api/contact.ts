import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { submitContact } from '../../application/contact/submitContact';
import { createContactDeps, type ContactEnv } from '../../infrastructure/contact/createContactDeps';
import { isLocale } from '../../i18n/config';
import { path } from '../../i18n/routes';

export const prerender = false;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

/**
 * Accepts JSON (enhanced form, `fetch`) and urlencoded/multipart (plain HTML form without JS).
 * Plain form posts get a 303 redirect to a localized result page.
 */
export const POST: APIRoute = async ({ request }) => {
  const type = request.headers.get('content-type') ?? '';
  const isJson = type.includes('application/json');

  let fields: Record<string, unknown>;
  try {
    fields = isJson
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({ ok: false, reason: 'invalid', fieldErrors: {} }, 400);
  }

  const locale = typeof fields.locale === 'string' && isLocale(fields.locale) ? fields.locale : 'es';
  const startedAt = Number(fields.startedAt);

  const result = await submitContact(
    {
      name: fields.name,
      email: fields.email,
      organization: fields.organization || undefined,
      topic: fields.topic,
      message: fields.message,
      consent: fields.consent === true || fields.consent === 'on' || fields.consent === 'true',
      locale,
    },
    {
      honeypot: typeof fields.website === 'string' ? fields.website : undefined,
      elapsedMs: Number.isFinite(startedAt) && startedAt > 0 ? Date.now() - startedAt : undefined,
    },
    createContactDeps(env as unknown as ContactEnv),
  );

  if (!isJson) {
    const target = result.ok ? path('contactSent', locale) : path('contactError', locale);
    return new Response(null, { status: 303, headers: { Location: target } });
  }

  if (result.ok) return json({ ok: true }, 200);
  const status = result.reason === 'invalid' ? 422 : result.reason === 'spam' ? 400 : 503;
  return json(result, status);
};

export const ALL: APIRoute = () => json({ ok: false, reason: 'method_not_allowed' }, 405);
