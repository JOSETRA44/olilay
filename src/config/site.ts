/**
 * Single source of truth for brand-level facts.
 * Only confirmed data lives here — empty values are rendered as absent,
 * never replaced with invented placeholders.
 */
export const site = {
  name: 'Olilay',
  url: 'https://olilay.com',
  email: 'ventas@olilay.com',
  foundingYear: 2026,
  /** Add profiles here once they exist; the footer only renders non-empty entries. */
  social: [] as { label: string; href: string }[],
  /**
   * Legal holder data. Pending until the company is formally constituted.
   * Legal pages show a "pending publication" notice while these are null.
   */
  legal: {
    holderName: null as string | null,
    taxId: null as string | null,
    address: null as string | null,
    jurisdiction: null as string | null,
  },
} as const;

export type Site = typeof site;
