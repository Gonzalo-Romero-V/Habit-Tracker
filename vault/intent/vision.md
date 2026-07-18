---
status: draft
type: intent
layer: H1
created: 2026-07-17
---

# Visión — Habit Tracker

## Visión

Habit Tracker es una aplicación multi-usuario para crear, programar y
monitorear hábitos personales (binarios o cuantificables), con recordatorios
push, categorización y estadísticas de consistencia (streaks). Existe para
cualquier persona que quiera sostener hábitos en el tiempo — el problema que
resuelve es la falta de visibilidad inmediata del progreso y la ausencia de
un recordatorio oportuno que empuje a actuar el día correcto. Es accesible
tanto desde web como desde un dispositivo móvil, con la misma cuenta.

## Propósito central

Ayudar a un usuario a construir y sostener hábitos personales mediante
seguimiento diario, cálculo de rachas y recordatorios, con una única API
consumida indistintamente por web y mobile.

## Invariantes de negocio

- Un usuario solo ve y modifica sus propios hábitos, categorías, métricas y
  registros — aislamiento estricto por `user_id`, siempre resuelto server-side
  a partir del token autenticado, nunca confiado desde el payload del cliente.
- El "día" de un hábito se determina por el timezone del usuario
  ([[user]].`timezone`), nunca por UTC ni por el timezone del servidor. Dos
  usuarios en zonas horarias distintas pueden tener "hoy" en fechas de
  calendario distintas para el mismo instante.
- Un hábito solo puede tener un registro de cumplimiento (`HabitLog`) por
  fecha de ocurrencia: la combinación `habit_id` + `occurrence_date` es única.
- La racha (streak) de un hábito se rompe a 0 apenas se falla un día
  programado. No hay tolerancia ni modo vacaciones en el MVP — es una regla
  simple e intencional (ver [[habit-log]]).
- Un hábito `quantifiable` completa su `HabitLog` del día solo cuando TODAS
  sus métricas obligatorias alcanzan su `target_value` para esa ocurrencia
  (ver [[habit-metric]], [[habit-metric-log]]).
- Los valores de métricas de tipo `duration` se almacenan siempre en segundos
  y los de tipo `currency` en unidades mínimas (centavos) + código ISO 4217.
  Nunca se persisten ni se serializan como floats.
- La regla de recurrencia de un hábito (qué días está "programado") se define
  al crear o editar el hábito; cambiarla no reescribe retroactivamente el
  historial de `HabitLog` ya generado — solo afecta ocurrencias futuras.

## Usuarios principales

- **Usuario final**: crea hábitos (binarios o cuantificables), define su
  recurrencia (diaria, días de semana específicos, o N veces por
  semana/período — al estilo de un evento recurrente de Google Calendar),
  registra su cumplimiento diario, recibe recordatorios push en su
  dispositivo, y consulta sus rachas y estadísticas de consistencia. Usa
  indistintamente la web o la app móvil (Capacitor) con la misma cuenta y el
  mismo backend.

## Fuera de alcance

### Definitivo (no planeado, ni siquiera a futuro)

- Modo vacaciones / días excusados que no rompan la racha (ver invariante
  de streak arriba).
- Gamificación (puntos, badges, logros).
- Funcionalidad social (compartir hábitos, amigos, leaderboards).
- Metas agregadas por período (ej. "sumar 10km esta semana" repartidos en
  varios días) — el MVP evalúa metas por ocurrencia individual, no por
  acumulado de un rango de fechas.
- Modo offline-first con sincronización diferida — la app asume
  conectividad para leer/escribir contra la API.
- Roles o RBAC — todo usuario autenticado tiene el mismo nivel de permiso,
  limitado a sus propios datos.

### Diferido (planeado, pero no en este MVP)

- **Proyectos** — un segundo módulo de la plataforma (Project → Phase →
  Activity, estilo WBS/PMBOK, con plazos opcionales y ajustables). No se
  modela en H2 todavía; la intención conceptual y su impacto en el modelo
  actual de Habit están documentados en [[roadmap]]. Ver ahí antes de
  tomar decisiones de diseño que pudieran cerrarle la puerta.
