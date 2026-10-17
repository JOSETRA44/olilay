# Despliegue en Cloudflare

> Este documento describe los pasos; ninguno se ha ejecutado todavía. Desplegar y modificar DNS requiere tu autorización y acceso a la cuenta.

## 1. Configurar Resend

1. Crea una cuenta en [resend.com](https://resend.com) y añade el dominio `olilay.com`.
2. Resend te mostrará registros DNS (SPF, DKIM y opcionalmente DMARC). Añádelos en el DNS del dominio. Si el dominio está en Cloudflare, se hace en **DNS → Records**.
3. Cuando el dominio aparezca como *verified*, crea una API key con permiso de envío.
4. El remitente configurado es `Olilay Web <web@olilay.com>` (`CONTACT_FROM_EMAIL` en `wrangler.jsonc`). Debe pertenecer al dominio verificado.
5. Asegúrate de que `ventas@olilay.com` existe y recibe correo, ya sea con un buzón real o con Cloudflare Email Routing hacia otro buzón.

## 2. Desarrollo local con envío real (opcional)

```bash
cp .env.example .dev.vars   # y pega RESEND_API_KEY
npm run dev
```

## 3. Desplegar

```bash
npx wrangler login
npm run build
npx wrangler deploy
npx wrangler secret put RESEND_API_KEY
```

O conecta el repositorio en **Workers & Pages → Create → Import a repository**, con el comando de build `npm run build` y la variable `NODE_VERSION=24`.

## 4. Dominio

En el panel del Worker, ve a **Settings → Domains & Routes** y añade `olilay.com` y `www.olilay.com` (redirige `www` al dominio principal con una *Redirect Rule*).

## 5. Comprobaciones tras el despliegue

- Envía un mensaje real desde `/contacto/` y desde `/en/contact/`.
- Abre `/sitemap-index.xml` y `/robots.txt`.
- Pasa Lighthouse sobre la portada.

## Pendientes reales

| Pendiente | Responsable | Dónde |
| --- | --- | --- |
| Verificar `olilay.com` en Resend y crear la API key | Equipo Olilay | Resend + DNS |
| Crear el buzón `ventas@olilay.com` | Equipo Olilay | Proveedor de correo / Email Routing |
| Datos legales del titular tras la constitución | Equipo Olilay | `src/config/site.ts` → `legal` |
| Revisión legal de privacidad y aviso legal según la jurisdicción | Asesoría legal | `src/content/legal/` |
| Perfiles en redes sociales (cuando existan) | Equipo Olilay | `src/config/site.ts` → `social` |
| (Opcional) Base de datos D1 | Equipo técnico | [database.md](database.md) |
| (Opcional) Cloudflare Turnstile contra spam, si llega spam real | Equipo técnico | Ver abajo |

## Opcional: Turnstile

El formulario ya filtra bots con un campo trampa (honeypot) y un tiempo mínimo de envío. Si aun así llega spam:

1. Crea un widget en **Cloudflare → Turnstile** y guarda `TURNSTILE_SECRET` como secreto.
2. Añade el widget al `ContactForm.astro` y envía su token con el formulario.
3. Valida el token en `src/pages/api/contact.ts` llamando a `https://challenges.cloudflare.com/turnstile/v0/siteverify` antes de invocar `submitContact`.
4. Actualiza la política de privacidad para mencionar Turnstile.
