---
status: draft
type: decision
layer: H3
created: 2026-07-17
---

# Arquitectura — Habit Tracker

## Patrón arquitectónico

- **Backend**: MVC clásico Laravel — Controller (HTTP, validación vía Form
  Requests) → Service (lógica de negocio: streaks, expansión de recurrencia,
  evaluación de metas) → Eloquent Model (persistencia y relaciones).
  Los Controllers nunca calculan reglas de negocio directamente.
- **Frontend**: Next.js App Router. Server Components por defecto para
  layout/estático; Client Components solo para las pantallas interactivas
  de tracking (check-off diario, formularios de captura de métricas). Toda
  la data proviene de la API Laravel vía fetch autenticado con Bearer
  token — no hay base de datos ni reglas de negocio en el frontend. Estilos
  globales, tema claro/oscuro y responsive: ver [[design-system]].
- **Mobile**: Capacitor envuelve el mismo build de Next.js (mismo código,
  no una segunda UI). **Decidido** (precedente probado en financehub, mismo
  stack): build dual por variable de entorno `BUILD_TARGET`. `BUILD_TARGET=mobile`
  compila con `output: 'export'` (export estático, sin servidor Next.js en
  el dispositivo) y llama a la API por URL absoluta; el build web normal
  usa `rewrites()` server-side para proxear `/api/*` hacia el backend. Ver
  [[environments]] para el detalle completo del mecanismo.

## Separación de responsabilidades

- **Controllers** (Laravel): reciben el request, validan con Form Requests,
  delegan en Services, devuelven Resources (envelope JSON, ver
  [[api-contracts]]). No hacen queries directas a Eloquent más allá de
  lookups triviales por id.
- **Services** (Laravel): concentran las reglas de negocio — cálculo de
  streak de un [[habit]], expansión de su regla de recurrencia a fechas de
  ocurrencia concretas, evaluación de si un [[habit-log]] pasa a
  `completed` (incluye chequear todas las [[habit-metric-log]] contra su
  `target_value`).
- **Models** (Eloquent): solo persistencia y relaciones — nunca llaman a
  APIs externas (el envío de push a FCM vive en un Job, no en el Model).
- **Jobs / Console Commands**: el scheduler de [[reminder]] corre como
  Artisan Command programado (Laravel Scheduler) que, por cada franja de
  tiempo, evalúa qué usuarios tienen un recordatorio debido *en su propio
  timezone* y encola un Job de envío de push por [[device-token]].
- **Job mensual de hábitos**: un Artisan Command programado (evaluado por
  timezone de cada [[user]], igual que el scheduler de recordatorios)
  que, al cierre de cada mes calendario, (1) materializa las filas
  `pending` de [[habit-log]] del mes siguiente para hábitos `fixed`
  expandiendo su `recurrence_rule`, y (2) consolida los agregados de
  [[habit-monthly-stat]] del mes que acaba de cerrar. Es una sola
  operación mensual, no dos jobs separados.
- **Frontend**: los componentes de página no hacen fetch directo; usan
  hooks (`hooks/`) que encapsulan las llamadas a la API y el manejo del
  token de auth (almacenamiento, refresh, adjunto del header
  `Authorization`).

## Convenciones de naming

- Backend: PascalCase para clases PHP; tablas en snake_case plural
  (`habits`, `habit_logs`, `habit_metrics`, `habit_metric_logs`,
  `device_tokens`, `reminders`, `categories`).
- Endpoints REST: `/api/v1/<recurso>` plural, kebab-case cuando el recurso
  es compuesto (ej. `/api/v1/habit-logs`, `/api/v1/device-tokens`).
- Frontend: kebab-case para nombres de archivo, camelCase para
  variables/funciones, PascalCase para componentes React.

## Gestión de autenticación y autorización

- **Auth**: Sanctum, tokens Bearer (`Authorization: Bearer <token>`). Un
  [[user]] puede tener múltiples tokens activos simultáneos (uno por
  dispositivo/sesión — web y mobile no comparten token).
- **Autorización**: cada recurso ([[habit]], [[category]], [[habit-log]],
  [[device-token]], [[reminder]]) se filtra siempre por el `user_id` del
  token autenticado, resuelto server-side vía Policies de Laravel — nunca
  confiando en un `user_id` que venga en el payload del cliente.
- No hay roles ni RBAC en el MVP: todo usuario autenticado tiene el mismo
  nivel de permiso, acotado estrictamente a sus propios datos (ver
  invariante de aislamiento en [[vision]]).

## Manejo de errores

- **Backend**: excepciones de negocio (ej. "este hábito ya tiene un log
  completado para hoy") se capturan en un Exception Handler central y se
  devuelven como JSON con `code` + `message` (formato exacto en
  [[api-contracts]]). Errores no esperados se loguean server-side y
  devuelven un 500 genérico sin detalle interno al cliente.
  **Gotcha verificado**: el skeleton de Laravel 12 no publica `lang/`
  por default — hay que correr `php artisan lang:publish` y traducir
  `validation.php`/`auth.php`/`passwords.php` a `lang/es/` a mano (no
  hay paquete oficial de traducciones); si no, los mensajes de
  validación salen en inglés pese a `APP_LOCALE=es`, violando
  [[i18n-copy]]. Además, `ValidationException::getMessage()` agrega un
  sufijo "(and N more errors)" hardcodeado en inglés en el core de
  Laravel — el Exception Handler arma el `mensaje` a mano desde
  `$e->errors()` en vez de usar `getMessage()` directo.
- **Frontend**: los errores de red/API se capturan en el hook de fetch
  compartido y se muestran vía UI de error explícita — no se dejan
  promesas rechazadas sin manejar.

## Paginación

**Decidido**: page-based, con el paginador nativo de Laravel
(`Model::paginate()`), no cursor-based. `meta` en el envelope (ver
[[api-contracts]]): `{ current_page, last_page, per_page, total }`. No
hay indicio en [[vision]] de volumen de datos que justifique cursor
(datos de un solo usuario, no un feed masivo).

## Versionado de metas (target_value / quota_target)

**Mecanismo H4** para lo que [[habit]] y [[habit-metric]] dejaron como
"versionado, mecanismo exacto a definir": tablas de historial dedicadas,
**sin** duplicar el valor "actual" en la tabla padre (una sola fuente de
verdad, evita drift entre dos lugares):

- `habit_quota_versions` (`habit_id`, `quota_target`, `quota_period`,
  `effective_from` date) — solo para hábitos `quota`.
- `habit_metric_target_versions` (`habit_metric_id`, `target_value`,
  `effective_from` date).

"Valor actual" = la versión con `effective_from` más reciente. "Valor
vigente en fecha X" (para evaluar un [[habit-log]]/[[habit-metric-log]]
histórico, o para dibujar la gráfica escalonada) = la versión con
`effective_from` más reciente que sea `<= X`. Editar el valor siempre
**inserta** una versión nueva — nunca se actualiza una fila existente.

## Bootstrap de materialización al crear un hábito `fixed`

El job mensual (ver arriba, "Job mensual de hábitos") cubre el estado
estable, pero un hábito `fixed` recién creado necesita sus ocurrencias
del mes en curso generadas ahí mismo — si no, no habría nada que marcar
como cumplido hasta el próximo cierre de mes. `HabitController::store()`
dispara la misma lógica de materialización de forma síncrona, acotada a
lo que resta del mes en curso, cuando `recurrence_type = fixed`.

## Decisiones pendientes

- [ ] Framework de testing del frontend: Vitest+Playwright vs Jest+Cypress.
- [ ] Dónde se despliega el Backend (Laravel) y el Frontend (Next.js) —
  sin definir.
- [ ] Versionado de API más allá de `/v1` (deprecation policy) — no urgente
  para MVP.
- [ ] Credenciales de Firebase (FCM) — todavía no existen; `Reminder`/
  `DeviceToken` se implementan con el envío de push stubeado hasta
  tenerlas.
