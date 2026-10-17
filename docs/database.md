# Base de datos

El sitio funciona sin base de datos: los mensajes del formulario se envían por email. La persistencia ya está implementada (`D1ContactRepository`) y se activa sin cambiar código, solo configurando el binding.

## Activar Cloudflare D1

```bash
# 1. Crear la base de datos (requiere sesión en Cloudflare: npx wrangler login)
npx wrangler d1 create olilay-db
```

2. Copia el `database_id` que devuelve el comando y descomenta el bloque `d1_databases` en `wrangler.jsonc`:

```jsonc
"d1_databases": [
  { "binding": "DB", "database_name": "olilay-db", "database_id": "<id>", "migrations_dir": "migrations" }
]
```

3. Regenera los tipos y aplica las migraciones:

```bash
npm run cf:types
npm run db:migrate:local    # base de datos local para `npm run dev`
npm run db:migrate:remote   # base de datos de producción
```

Desde ese momento, `createContactDeps` detecta `env.DB` y cada mensaje se guarda en `contact_messages` además de enviarse por email.

## Esquema

`migrations/0001_contact_messages.sql`:

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | TEXT PK | UUID generado en el caso de uso |
| `name`, `email`, `topic`, `message` | TEXT | Validados con `contactInputSchema` |
| `organization` | TEXT NULL | Opcional |
| `locale` | TEXT | `es` / `en` |
| `consent` | INTEGER | 1 = aceptó la política de privacidad |
| `received_at` | TEXT | ISO 8601 (UTC) |
| `status` | TEXT | `new` / `replied` / `archived`, pensado para un futuro panel |

Las migraciones nuevas se añaden como `migrations/0002_*.sql`, `0003_*.sql`, etc. Wrangler aplica solo las que faltan.

## Consultar mensajes

```bash
npx wrangler d1 execute olilay-db --remote \
  --command "SELECT received_at, name, email, topic FROM contact_messages ORDER BY received_at DESC LIMIT 20"
```

## Usar otra base de datos (Supabase, Neon, Postgres…)

1. Crea `src/infrastructure/contact/PostgresContactRepository.ts` implementando `ContactRepository`:

```ts
import type { ContactRepository } from '../../domain/contact/ports';
import type { ContactMessage } from '../../domain/contact/ContactMessage';

export class PostgresContactRepository implements ContactRepository {
  readonly durable = true;
  constructor(private readonly sql: (query: string, params: unknown[]) => Promise<unknown>) {}
  async save(m: ContactMessage) {
    await this.sql(
      'insert into contact_messages (id, name, email, organization, topic, message, locale, consent, received_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [m.id, m.name, m.email, m.organization ?? null, m.topic, m.message, m.locale, m.consent, m.receivedAt.toISOString()],
    );
  }
}
```

2. Selecciónalo en `createContactDeps.ts` cuando exista la variable de conexión, por ejemplo `DATABASE_URL`, guardada como secreto. En Workers conviene usar Hyperdrive o un driver HTTP compatible.
3. El esquema SQL de `0001` sirve casi tal cual en Postgres (cambia `TEXT` por `timestamptz` en `received_at` y `INTEGER` por `boolean` en `consent`).

## Futuro: más entidades

El mismo patrón sirve para otras funcionalidades con datos, como suscripciones o solicitudes de demo de un producto:

1. Entidad y puerto en `src/domain/<feature>/`.
2. Caso de uso en `src/application/<feature>/`.
3. Adaptador D1 en `src/infrastructure/<feature>/` y una migración nueva.
4. Endpoint en `src/pages/api/<feature>.ts` con `export const prerender = false`.
