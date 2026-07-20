---
status: draft
type: decision
layer: H3
created: 2026-07-17
code_path: ""
---

# API Contracts — Habit Tracker

## Convenciones generales

- Base path: `/api/v1/`.
- Auth: header `Authorization: Bearer <token>` (Sanctum personal access
  token) en todos los endpoints salvo `/api/v1/auth/login` y
  `/api/v1/auth/register`.
- Respuesta exitosa: `{ "data": ..., "mensaje": "..." }` — `data` es el
  recurso único o array; `mensaje` es opcional (solo cuando hay algo que
  comunicar al usuario, ej. "Hábito creado"), en español, y **es la que
  puede llegar directo a un toast de la UI** — sigue la convención de
  [[i18n-copy]]. Se usa la clave `mensaje`, no `message` (precedente
  financehub: mismo stack, convención ya probada). Cuando hay paginación
  se agrega `"meta"` (esquema exacto pendiente, ver [[architecture]] →
  Decisiones pendientes).
- Respuesta de error: `{ "error": { "code": "string", "mensaje": "string" } }`.
  `code` es una clave estable en inglés/snake_case para que el cliente
  pueda hacer lógica sobre ella (ej. `HABIT_LOG_ALREADY_EXISTS`);
  `mensaje` es el texto en español neutro EC, listo para mostrarse.
  Status HTTP acorde: 422 validación, 401 no autenticado, 403 no
  autorizado, 404 no encontrado, 500 inesperado.
  En errores 422 de validación, el envelope agrega `"fields"`: un mapa
  `{ campo: [mensajes...] }` (formato nativo de Laravel) para que el
  frontend pueda mostrar el error pegado al campo del formulario, no solo
  el resumen de `mensaje` (que toma el primer mensaje de validación, sin
  el sufijo "(and N more errors)" que el core de Laravel agrega en
  inglés — se arma a mano en el Exception Handler, no se usa
  `$e->getMessage()` directo).
- Fechas: ISO 8601 en UTC en toda la API. La conversión a "qué día es hoy"
  para un usuario ocurre siempre usando `[[user]].timezone` en el Service
  correspondiente del backend — nunca se asume el timezone del servidor ni
  se delega ese cálculo al frontend.
- Header `X-Client-Timezone` (IANA, ej. `America/Guayaquil`): opcional en
  cada request autenticado. Cuando llega, el backend lo usa para refrescar
  oportunistamente `[[user]].timezone` (detalle en [[user]] → Reglas de
  negocio). Precedente: financehub usa el mismo patrón para resolver
  fechas correctamente sin depender de un campo de perfil desactualizado.

## Recursos principales

> El contrato definitivo lo fija el código en `app/backend/routes/api.php` —
> esta sección es la intención de diseño, no la fuente de verdad final.
> Al implementar, actualizar `code_path` de esta nota vía `/sync`.

- `/api/v1/auth/{register,login,logout}` — autenticación, emite/revoca
  tokens Sanctum.
- `/api/v1/auth/google` — recibe `{ id_token, timezone }`, verifica el ID
  token de Google (ver [[stack]]) y crea/vincula/loguea la cuenta; mismo
  shape de respuesta que login/register (`{ data: { user, token },
  mensaje }`). Un email que ya tiene cuenta con password se vincula
  automáticamente (ver [[user]] → Reglas de negocio).
- `/api/v1/auth/me` (autenticado) — devuelve el usuario del token actual;
  no estaba en el diseño original de esta nota, se agregó al implementar
  porque el frontend necesita hidratar la sesión al cargar sin volver a
  pedir credenciales. Aplica el middleware `sync.timezone` (ver
  [[user]] → Reglas de negocio, header `X-Client-Timezone`).
- `/api/v1/habits` — CRUD de [[habit]] (incluye su regla de recurrencia y
  `tracking_type`).
- `/api/v1/habits/{habit}/metrics` — CRUD de [[habit-metric]] asociadas a
  un hábito `quantifiable`.
- `/api/v1/habits/{habit}/logs` — listar/crear [[habit-log]] (registro de
  cumplimiento por fecha de ocurrencia); crear un log con métricas anida
  sus [[habit-metric-log]] en el mismo payload.
- `/api/v1/categories` — CRUD de [[category]].
- `/api/v1/device-tokens` — registrar/eliminar [[device-token]] del
  dispositivo actual (usado por el scheduler de [[reminder]] para push).
- `/api/v1/habits/{habit}/reminders` — CRUD de [[reminder]] del hábito.
- `/api/v1/habits/{habit}/stats/monthly` — lectura de agregados
  [[habit-monthly-stat]] (histórico, meses ya cerrados); el mes en curso
  se calcula al vuelo desde [[habit-log]], no desde este endpoint.

## Reglas

- Ningún endpoint acepta `user_id` en el body — siempre se infiere del
  token autenticado (ver [[architecture]] → Gestión de autenticación).
- Crear un `HabitLog` para una `occurrence_date` que ya tiene uno existente
  es un 422 (conflicto), no un upsert silencioso — el cliente debe usar el
  endpoint de actualización explícitamente.
- `DELETE /api/v1/habits/{habit}` y `DELETE
  /api/v1/habits/{habit}/logs/{log}` existen como borrado físico real (no
  soft-delete) — pensados como mantenimiento/corrección de errores. El
  flujo normal de la app usa `PATCH /api/v1/habits/{habit}` con
  `status=archived` para "dejar de seguir" un hábito sin perder su
  historial (ver [[habit]]).
