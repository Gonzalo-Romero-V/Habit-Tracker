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
- La racha (streak) de un hábito se rompe a 0 apenas se falla la unidad de
  cumplimiento correspondiente a su `recurrence_type`: un día programado en
  hábitos `fixed`, o un período (semana) que cierra sin alcanzar la cuota
  en hábitos `quota`. No hay tolerancia ni modo vacaciones en el MVP, en
  ninguno de los dos modos (ver [[habit]], [[habit-log]]).
- Un hábito define su recurrencia con **uno de dos motores mutuamente
  excluyentes**, elegido al crearlo y no editable después:
  `fixed` (días concretos vía RRULE, ej. lunes/miércoles/viernes) o
  `quota` (N veces por período, sin días fijos — el usuario elige cuándo
  dentro de la semana). Ver [[habit]] para el detalle.
- Un hábito `quantifiable` completa su `HabitLog` del día solo cuando TODAS
  sus métricas obligatorias alcanzan su `target_value` para esa ocurrencia
  (ver [[habit-metric]], [[habit-metric-log]]). Esto es ortogonal a
  `recurrence_type` — no confundir con la meta de frecuencia de un hábito
  `quota` (esa es cantidad de días cumplidos, no un valor de métrica).
- Los valores de métricas de tipo `duration` se almacenan siempre en segundos
  y los de tipo `currency` en unidades mínimas (centavos) + código ISO 4217.
  Nunca se persisten ni se serializan como floats.
- La regla de recurrencia de un hábito (`recurrence_rule` en `fixed`, o
  `quota_target`/`quota_period` en `quota`) se define al crear el hábito;
  editarla no reescribe retroactivamente el historial de `HabitLog` ya
  generado ni re-evalúa períodos ya cerrados — solo afecta hacia adelante.

## Usuarios principales

- **Usuario final**: crea hábitos (binarios o cuantificables), define su
  recurrencia — días fijos (diaria o días de semana específicos, modo
  `fixed`) o una cuota semanal sin días fijos (modo `quota`) — registra su
  cumplimiento, recibe recordatorios push en su dispositivo, y consulta sus
  rachas y estadísticas de consistencia. Usa indistintamente la web o la
  app móvil (Capacitor) con la misma cuenta y el mismo backend.

## Fuera de alcance

### Definitivo (no planeado, ni siquiera a futuro)

- Modo vacaciones / días excusados que no rompan la racha (ver invariante
  de streak arriba).
- Gamificación (puntos, badges, logros).
- Funcionalidad social (compartir hábitos, amigos, leaderboards).
- Metas agregadas por período sobre el **valor de una métrica** (ej. "sumar
  10km esta semana" repartidos en varios días) — el MVP evalúa metas de
  [[habit-metric]] por ocurrencia individual, no por acumulado de un rango
  de fechas. **No confundir** con el modo `quota` de [[habit]] (contar N
  días completados por semana) — eso sí está en el MVP; lo fuera de
  alcance es sumar *valores* de métrica entre días.
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
