# Habit Tracker

Aplicación multi-usuario para crear, programar y monitorear hábitos
personales (binarios o cuantificables), con recordatorios push,
categorización y estadísticas de consistencia (streaks). API desacoplada
(Laravel), consumida por un frontend web (Next.js) y por la misma app
empaquetada para mobile vía Capacitor.

Visión completa, invariantes de negocio y alcance: [`vault/intent/vision.md`](vault/intent/vision.md).

---

## Estado del proyecto

**Scaffold inicial listo.** `app/backend` (Laravel 12 + Sanctum, migrado
contra PostgreSQL) y `app/frontend` (Next.js App Router + Tailwind v4 +
shadcn/ui sobre Radix) ya existen. Sin features de dominio todavía (no hay
páginas ni endpoints de `habit`/`category`/etc.) — la sesión de modelado
dejó documentado en el vault:

- [`vault/intent/vision.md`](vault/intent/vision.md) — H1: visión, invariantes, alcance.
- [`vault/intent/roadmap.md`](vault/intent/roadmap.md) — H1: evolución futura (módulo Proyectos), diferido.
- [`vault/decisions/stack.md`](vault/decisions/stack.md) — H3: stack elegido y por qué.
- [`vault/decisions/architecture.md`](vault/decisions/architecture.md) — H3: patrón, capas, convenciones.
- [`vault/decisions/api-contracts.md`](vault/decisions/api-contracts.md) — H3: convenciones REST.
- [`vault/decisions/environments.md`](vault/decisions/environments.md) — H3: parametrización vía `.env`, build web vs. mobile.
- [`vault/decisions/design-system.md`](vault/decisions/design-system.md) — H3: Tailwind v4 + shadcn/ui, tema, responsive.
- [`vault/decisions/i18n-copy.md`](vault/decisions/i18n-copy.md) — H3 🔒: español neutro EC, sin voseo.
- [`vault/domain/`](vault/domain/) — H2: `user`, `category`, `habit`, `habit-metric`, `habit-log`, `habit-metric-log`, `device-token`, `reminder`.

Antes de escribir código, revisar las "Decisiones pendientes" que sí siguen
abiertas en `decisions/architecture.md` (testing frontend, hosting,
paginación) y `decisions/design-system.md` (paleta de marca, safe-area).

---

## Cómo levantar el proyecto en local

Requisitos: PHP 8.2+, Composer 2, Node 18.18+, PostgreSQL 17 (con una base
ya creada), npm.

### Backend (`app/backend`)

```bash
cd app/backend
composer install
cp .env.example .env    # solo si .env no existe todavía
php artisan key:generate
# Editar .env: DB_CONNECTION=pgsql, DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan migrate
php artisan serve        # http://localhost:8000
```

### Frontend (`app/frontend`)

```bash
cd app/frontend
npm install
npm run dev               # http://localhost:3000
```

En desarrollo web, `next.config.ts` proxea `/api/*` hacia `BACKEND_URL`
(default `http://localhost:8000`) — ver `vault/decisions/environments.md`
para el mecanismo completo y el build mobile (Capacitor).

---

## Stack (resumen — detalle en `vault/decisions/stack.md`)

- Backend: Laravel + PostgreSQL + Sanctum (API tokens).
- Frontend web: Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui.
- Frontend mobile: el mismo código Next.js empaquetado con Capacitor
  (build estático vía `BUILD_TARGET=mobile`, ver `decisions/environments.md`).
- Push: Firebase Cloud Messaging (`@capacitor-firebase/messaging`).
- Idioma: español neutro Ecuador en toda la app (ver `decisions/i18n-copy.md`).

---

## Cómo trabajar en este repo (agentes de IA y humanos)

Este proyecto usa **Code Vault**: un vault Obsidian (`vault/`) como fuente
de verdad semántica, sincronizado con el código vía un engine determinista.

- **Agentes de IA**: leer [`AGENTS.md`](AGENTS.md) antes de tocar código —
  define qué notas del vault leer según la tarea.
- **Humanos**: manual de uso del sistema en [`USAGE.md`](USAGE.md).
- **Cómo funciona el vault por dentro**: [`vault/SYSTEM.md`](vault/SYSTEM.md).

Flujo diario resumido: codear → commit (con permiso explícito) → el hook
`post-commit` genera `.vault-sync/{change_report,facts}.json` → `/sync`
propone cambios al vault → humano aprueba → vault queda alineado al código.
