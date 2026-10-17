import type { ContactField } from '../domain/contact/ContactMessage';

interface Messages {
  status: { ok: string; invalid: string; spam: string; unavailable: string; network: string };
  errors: Record<ContactField, string>;
  sending: string;
  submit: string;
  email: string;
}

type ApiResponse =
  | { ok: true }
  | { ok: false; reason: 'invalid'; fieldErrors: Partial<Record<ContactField, string>> }
  | { ok: false; reason: 'spam' | 'unavailable' };

/** Progressive enhancement of the contact form: fetch submit, inline errors, topic preselect. */
export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  if (!form) return;

  const messages = JSON.parse(form.dataset.messages ?? '{}') as Messages;
  const status = form.querySelector<HTMLElement>('#form-status')!;
  const submit = form.querySelector<HTMLButtonElement>('.form__submit')!;
  const hints = new Map<string, { el: HTMLElement; initial: string }>();
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
    hints.set(el.dataset.errorFor!, { el, initial: el.textContent ?? '' });
  });

  (form.elements.namedItem('startedAt') as HTMLInputElement).value = String(Date.now());

  // Preselect the topic from links like /contacto/?tema=web
  const params = new URLSearchParams(location.search);
  const topic = params.get('tema') ?? params.get('topic');
  const select = form.querySelector<HTMLSelectElement>('select[name="topic"]')!;
  if (topic && [...select.options].some((o) => o.value === topic)) select.value = topic;

  const setStatus = (state: 'ok' | 'error' | '', html = '') => {
    status.dataset.state = state;
    status.innerHTML = html;
  };

  const mailLink = `<a href="mailto:${messages.email}">${messages.email}</a>`;

  const clearErrors = () => {
    hints.forEach(({ el, initial }, field) => {
      el.textContent = initial;
      delete el.dataset.invalid;
      form.querySelector(`[name="${field}"]`)?.removeAttribute('aria-invalid');
    });
  };

  const showErrors = (fieldErrors: Partial<Record<ContactField, string>>) => {
    let first: HTMLElement | null = null;
    for (const [field, code] of Object.entries(fieldErrors)) {
      const hint = hints.get(field);
      const input = form.querySelector<HTMLElement>(`[name="${field}"]`);
      if (hint) {
        hint.el.textContent = messages.errors[(code as ContactField) ?? field] ?? messages.errors[field as ContactField];
        hint.el.dataset.invalid = '';
      }
      input?.setAttribute('aria-invalid', 'true');
      first ??= input;
    }
    first?.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    if (!form.reportValidity()) return;

    setStatus('');
    submit.disabled = true;
    submit.textContent = messages.sending;

    const data = Object.fromEntries(new FormData(form).entries());
    const payload = { ...data, consent: data.consent === 'on' };

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (result.ok) {
        setStatus('ok', `✓ ${messages.status.ok}`);
        form.reset();
        (form.elements.namedItem('startedAt') as HTMLInputElement).value = String(Date.now());
      } else if (result.reason === 'invalid') {
        setStatus('error', `✕ ${messages.status.invalid}`);
        showErrors(result.fieldErrors);
      } else if (result.reason === 'spam') {
        setStatus('error', `✕ ${messages.status.spam}`);
      } else {
        setStatus('error', `✕ ${messages.status.unavailable} ${mailLink}.`);
      }
    } catch {
      setStatus('error', `✕ ${messages.status.network} ${mailLink}.`);
    } finally {
      submit.disabled = false;
      submit.textContent = messages.submit;
    }
  });
}
