# Arquitectura

## Principios

La complejidad está ajustada a la realidad del proyecto. La mayor parte del sitio es contenido estático, así que se prerenderiza a HTML. Solo el formulario de contacto tiene lógica de servidor, y esa es la única parte organizada en capas al estilo Clean Architecture.

## Capas del formulario de contacto

```
pages/api/contact.ts            ← transporte HTTP (JSON o formulario clásico)
        │ compone
        ▼
application/contact/submitContact.ts   ← caso de uso: anti-spam → validar → guardar → notificar
        │ depende solo de
        ▼
domain/contact/                  ← ContactMessage (esquema zod) + puertos ContactRepository / ContactNotifier
        ▲ implementan
        │
infrastructure/contact/          ← D1ContactRepository, NoopContactRepository, ResendNotifier, createContactDeps
```

La regla de dependencias es que `domain` no importa nada del proyecto y `application` solo importa de `domain`. `infrastructure` implementa los puertos, y el endpoint es el único sitio donde se conectan las piezas.

### Política de fallos

`decideOutcome()`, en `submitContact.ts`, considera recibido un mensaje si **al menos un canal lo conservó**, ya sea guardado en la base de datos o enviado por email. Si todos los canales fallaron o no están configurados, el usuario recibe el aviso de escribir directamente a `ventas@olilay.com`.

### Añadir un adaptador

Ejemplos: guardar en Postgres o notificar por Slack.

1. Crea una clase en `src/infrastructure/contact/` que implemente `ContactRepository` o `ContactNotifier`.
2. Selecciónala en `createContactDeps.ts` según la variable o el binding que corresponda.
3. Ni el caso de uso ni el endpoint cambian.

Si se necesitan varios notificadores a la vez, crea un `CompositeNotifier` que implemente `ContactNotifier` y delegue en una lista.

## Mejora progresiva

| Funcionalidad | Sin JS | Con JS |
| --- | --- | --- |
| Formulario | Validación nativa, POST clásico y redirección 303 a `/contacto/enviado/` o `/contacto/error/` | `fetch` con estado en línea y errores por campo |
| Menú móvil | API `popover` nativa | La misma, sin JS adicional |
| Acordeón de servicios | `<details name>` exclusivo | Lo mismo, con animación CSS (`::details-content`) |
| Tema | Sigue `prefers-color-scheme` | Interruptor guardado en `localStorage`, sin parpadeo inicial |
| Transiciones | View transitions entre documentos (CSS) | La misma |

## Sistema de diseño

- **Tokens** (`src/styles/tokens.css`): una paleta base en OKLCH y tokens semánticos `--c-*`. Los componentes solo usan los tokens semánticos. El modo oscuro redefine esos tokens dos veces: una para la preferencia del sistema y otra para la elección explícita del usuario.
- **Componentes** con estilos encapsulados en `.astro`. Las piezas compartidas son `SectionHead`, `PageHead`, `Button`, `Marquee`, `ServicesAccordion`, `ProductGrid`, `CtaBand` y `ContactForm`.
- **Movimiento**: `prefers-reduced-motion` desactiva el marquee, la aparición al hacer scroll y las view transitions.

## i18n

- `src/i18n/config.ts`: locales disponibles.
- `src/i18n/routes.ts`: slugs traducidos por ruta. De aquí salen el selector de idioma, los `hreflang` y los enlaces internos.
- `src/i18n/ui.ts`: textos de interfaz. El español define el tipo `Dictionary`, así que si al inglés le falta una clave, `astro check` falla.
- El contenido largo vive en `src/content/<colección>/<locale>/`.
