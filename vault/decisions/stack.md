---
status: draft
type: decision
layer: H3
created: 2026-07-17
---

# Stack — Habit Tracker

## Stack elegido

- Backend: Laravel 12 + PostgreSQL 17 + Sanctum (API tokens, no cookies SPA).
- Frontend web: Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui
  (ver [[design-system]] para tokens, tema claro/oscuro y responsive).
- Frontend mobile: el **mismo codebase** Next.js, empaquetado con Capacitor
  (iOS/Android) — un solo código de UI, dos shells de distribución.
- Recurrencia de hábitos — dos motores, sin mezclar (ver [[habit]]):
  - Modo `fixed`: librería `rlanvin/php-rrule` (RFC5545) en el backend
    para expandir `recurrence_rule` (FREQ/INTERVAL/BYDAY) en fechas
    concretas de ocurrencia. Pinneada — no hay ambigüedad de cuál usar.
  - Modo `quota`: **sin librería** — es aritmética de ventana de fechas
    (contar `HabitLog` `completed` dentro de la semana ISO del timezone
    del usuario contra `quota_target`), no necesita RRULE ni ninguna
    dependencia externa.
- Notificaciones push: Firebase Cloud Messaging (FCM) como transporte único
  — para Android directo, para iOS vía el relay de FCM a APNs. Cliente:
  plugin `@capacitor-firebase/messaging` (precedente probado en financehub
  con el mismo stack, preferido sobre `@capacitor/push-notifications` +
  SDK de Firebase por separado).
- Colas/scheduler: Laravel Queue + Scheduler (`schedule:work` / cron) para
  evaluar recordatorios pendientes por timezone de usuario y despachar los
  Jobs de envío de push.

## Motivación

La API va desacoplada del frontend porque hay dos consumidores desde el día
uno (web y mobile) que no deben duplicar lógica de negocio (cálculo de
streaks, evaluación de metas, expansión de recurrencia). Next.js se reutiliza
para ambos targets — un solo código de UI en vez de mantener dos frontends
(ej. Next.js + Flutter) — priorizando velocidad de desarrollo sobre un
"look" 100% nativo. Sanctum con tokens Bearer (no cookies de sesión SPA)
porque Capacitor corre como app nativa empaquetada: el contexto no es un
browser same-site, así que cookies complican CORS/CSRF sin aportar nada que
un token Bearer no resuelva más simple.

## Alternativas descartadas

- **Laravel Passport** (OAuth2 completo): descartado — es infraestructura
  pensada para que terceros consuman tu API; acá el único consumidor es
  nuestro propio frontend (web + mobile), Sanctum alcanza.
- **Sanctum SPA (cookies same-site)**: descartado porque Capacitor no es un
  contexto "browser same-site"; forzar cookies ahí genera fricción de CORS
  sin beneficio real sobre un token Bearer.
- **Frontend mobile nativo separado** (React Native / Flutter): descartado
  por el costo de mantener 2 UIs en paralelo; Capacitor permite reusar el
  Next.js existente y reduce superficie de mantenimiento.
- **MySQL**: descartado a favor de PostgreSQL por mejor soporte de tipos
  ricos (enums nativos, jsonb) que simplifican el modelado de
  `metric_type` y la regla de recurrencia.

## Restricciones derivadas

- Toda la lógica de negocio (streaks, evaluación de metas, expansión de
  recurrencia) vive en servicios del backend Laravel — el frontend nunca
  calcula reglas de negocio, solo las consume vía API (ver
  [[architecture]] → Separación de responsabilidades).
- Los valores monetarios y de duración nunca se serializan como floats en la
  API: `duration` en segundos (entero), `currency` en unidades mínimas
  (centavos, entero) + código ISO 4217 (ver [[habit-metric]]).
- El frontend Next.js se compila en dos modos según `BUILD_TARGET` (web
  con rewrites server-side vs. mobile con export estático) — mecanismo
  completo en [[environments]].
- Los endpoints viven exclusivamente bajo `/api/v1/*` (ver
  [[api-contracts]]) — nunca rutas `web.php` para datos de la aplicación.

## Herramientas de desarrollo

- Backend: PHPUnit, Pint, migraciones Laravel, `php artisan schedule:work`
  en desarrollo local.
- Frontend: linter ESLint flat config; framework de testing sin definir aún
  (ver [[architecture]] → Decisiones pendientes).
- Push: proyecto Firebase compartido entre ambas apps (Android/iOS),
  credenciales fuera del repo vía `.env` / `google-services.json` (nunca
  commiteados).
