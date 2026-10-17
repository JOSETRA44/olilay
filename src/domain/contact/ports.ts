import type { ContactMessage } from './ContactMessage';

/**
 * Ports implemented in `src/infrastructure/contact`. The application layer only
 * depends on these interfaces, so storage or delivery providers can be swapped
 * (D1 → Postgres, Resend → another email API) without touching the use case.
 */
export interface ContactRepository {
  /** Whether this repository actually stores data (false for the no-op adapter). */
  readonly durable: boolean;
  save(message: ContactMessage): Promise<void>;
}

export interface ContactNotifier {
  /** Whether the notifier is configured with the credentials it needs. */
  readonly configured: boolean;
  notify(message: ContactMessage): Promise<void>;
}
