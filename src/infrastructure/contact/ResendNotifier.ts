import type { ContactMessage } from '../../domain/contact/ContactMessage';
import type { ContactNotifier } from '../../domain/contact/ports';

interface ResendConfig {
  apiKey?: string;
  from: string;
  to: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Sends each contact message to the sales inbox through the Resend REST API (no SDK needed on Workers). */
export class ResendNotifier implements ContactNotifier {
  constructor(private readonly config: ResendConfig) {}

  get configured(): boolean {
    return Boolean(this.config.apiKey);
  }

  async notify(message: ContactMessage): Promise<void> {
    const rows: [string, string][] = [
      ['Nombre', message.name],
      ['Email', message.email],
      ['Organización', message.organization ?? '—'],
      ['Tema', message.topic],
      ['Idioma', message.locale],
      ['Recibido', message.receivedAt.toISOString()],
      ['ID', message.id],
    ];

    const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${message.message}`;
    const html = `<table cellpadding="4">${rows
      .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`)
      .join('')}</table><hr><p style="white-space:pre-wrap">${escapeHtml(message.message)}</p>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.from,
        to: [this.config.to],
        reply_to: message.email,
        subject: `[olilay.com] ${message.topic} — ${message.name}`,
        text,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
    }
  }
}
