import {
  contactInputSchema,
  type ContactField,
  type ContactMessage,
} from '../../domain/contact/ContactMessage';
import type { ContactNotifier, ContactRepository } from '../../domain/contact/ports';

export interface SubmitContactDeps {
  repository: ContactRepository;
  notifier: ContactNotifier;
  now?: () => Date;
  newId?: () => string;
}

/** Anti-spam signals collected by the transport layer. */
export interface SubmissionSignals {
  /** Value of the hidden honeypot field; humans leave it empty. */
  honeypot?: string;
  /** Milliseconds between form render and submit, when the client reported it. */
  elapsedMs?: number;
}

export type SubmitContactResult =
  | { ok: true; id: string }
  | { ok: false; reason: 'invalid'; fieldErrors: Partial<Record<ContactField, string>> }
  | { ok: false; reason: 'spam' }
  | { ok: false; reason: 'unavailable' };

const MIN_FILL_TIME_MS = 3000;

/** Outcome of each delivery channel: `skipped` means not configured. */
export type ChannelOutcome = 'done' | 'failed' | 'skipped';

/**
 * Failure policy: the message counts as received if at least one channel
 * actually kept it (stored durably or delivered by email). If every channel
 * was skipped or failed, the visitor must be told to use the email fallback.
 */
export function decideOutcome(stored: ChannelOutcome, notified: ChannelOutcome): 'ok' | 'unavailable' {
  return stored === 'done' || notified === 'done' ? 'ok' : 'unavailable';
}

async function attempt(enabled: boolean, label: string, run: () => Promise<void>): Promise<ChannelOutcome> {
  if (!enabled) return 'skipped';
  try {
    await run();
    return 'done';
  } catch (error) {
    console.error(`[contact] ${label} failed`, error);
    return 'failed';
  }
}

export async function submitContact(
  raw: unknown,
  signals: SubmissionSignals,
  deps: SubmitContactDeps,
): Promise<SubmitContactResult> {
  if (signals.honeypot) return { ok: false, reason: 'spam' };
  if (signals.elapsedMs !== undefined && signals.elapsedMs < MIN_FILL_TIME_MS) return { ok: false, reason: 'spam' };

  const parsed = contactInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, reason: 'invalid', fieldErrors };
  }

  const message: ContactMessage = {
    ...parsed.data,
    id: (deps.newId ?? (() => crypto.randomUUID()))(),
    receivedAt: (deps.now ?? (() => new Date()))(),
  };

  const stored = await attempt(deps.repository.durable, 'repository.save', () => deps.repository.save(message));
  const notified = await attempt(deps.notifier.configured, 'notifier.notify', () => deps.notifier.notify(message));

  return decideOutcome(stored, notified) === 'ok' ? { ok: true, id: message.id } : { ok: false, reason: 'unavailable' };
}
