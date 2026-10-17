import type { ContactMessage } from '../../domain/contact/ContactMessage';
import type { ContactRepository } from '../../domain/contact/ports';

/** The subset of the Cloudflare D1 binding this adapter relies on. */
export interface D1Like {
  prepare(query: string): { bind(...values: unknown[]): { run(): Promise<unknown> } };
}

/** Persists messages in the `contact_messages` table (see migrations/0001_contact_messages.sql). */
export class D1ContactRepository implements ContactRepository {
  readonly durable = true;

  constructor(private readonly db: D1Like) {}

  async save(message: ContactMessage): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO contact_messages (id, name, email, organization, topic, message, locale, consent, received_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        message.id,
        message.name,
        message.email,
        message.organization ?? null,
        message.topic,
        message.message,
        message.locale,
        message.consent ? 1 : 0,
        message.receivedAt.toISOString(),
      )
      .run();
  }
}

/** Used while no database is bound: nothing is stored, delivery relies on the notifier. */
export class NoopContactRepository implements ContactRepository {
  readonly durable = false;
  async save(): Promise<void> {}
}
