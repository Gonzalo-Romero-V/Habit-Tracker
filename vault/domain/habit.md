---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: ""
---

# Habit

## Definición

Un hábito que un [[user]] quiere sostener en el tiempo. Define **qué** se
rastrea (binario o cuantificable), **cuándo** está programado (regla de
recurrencia) y opcionalmente a qué [[category]] pertenece. Es la entidad
raíz de la que cuelgan [[habit-metric]], [[habit-log]] y [[reminder]].

## Estados

- `active` — genera ocurrencias según su recurrencia; su racha (streak)
  avanza o se rompe según el cumplimiento.
- `archived` — terminal. Deja de generar nuevas ocurrencias; su historial
  de [[habit-log]] se conserva pero ya no se evalúa para streak activo.

No existe un estado `paused` con congelamiento de racha ("modo vacaciones")
— eso está explícitamente fuera de alcance del MVP (ver [[vision]]). Pausar
hoy significa archivar; retomar el hábito implica crear uno nuevo.

## Atributos clave

- `tracking_type` ∈ `{binary, quantifiable}` — inmutable una vez creado el
  hábito (cambiarlo invalidaría la interpretación de los [[habit-log]]
  históricos). Si `quantifiable`, el hábito tiene una o más
  [[habit-metric]] asociadas (el usuario define sus propias métricas, ej.
  para "leer un libro": una métrica de tiempo y otra de páginas).
- `recurrence_rule` — regla de recurrencia tipo RFC5545/RRULE (FREQ=DAILY,
  FREQ=WEEKLY;BYDAY=MO,WE,FR, FREQ=WEEKLY;INTERVAL=1 con un `count`
  objetivo de N veces en el período, etc. — inspirado en la flexibilidad de
  un evento recurrente de Google Calendar). Es la fuente de verdad de
  "cuándo está programado" el hábito; un Service del backend la expande a
  fechas concretas de ocurrencia (ver [[architecture]]).
- `current_streak` / `best_streak` — **derivados**, no la fuente de verdad.
  Se recalculan a partir del historial de [[habit-log]]; pueden
  denormalizarse en la tabla por performance, pero ante cualquier duda el
  historial de logs manda.

## Relaciones

- N:1 con [[user]] — pertenece a un único usuario.
- N:1 (opcional) con [[category]].
- 1:N con [[habit-metric]] — solo si `tracking_type = quantifiable`.
- 1:N con [[habit-log]] — una ocurrencia programada genera un log.
- 1:N con [[reminder]] — un hábito puede tener más de un recordatorio
  (ej. mañana y noche).

## Reglas de negocio

- El día que determina si un hábito "está programado hoy" usa siempre el
  `timezone` de su [[user]] dueño, nunca UTC ni el timezone del servidor.
- Editar `recurrence_rule` afecta solo ocurrencias futuras; no reescribe
  `occurrence_date` de [[habit-log]] ya generados.
- Un hábito `binary` se considera `completed` en su [[habit-log]] del día
  con un solo check-off. Un hábito `quantifiable` requiere que **todas**
  sus [[habit-metric]] alcancen el `target_value` correspondiente vía sus
  [[habit-metric-log]] de esa ocurrencia.
- Fallar una ocurrencia programada (día programado sin `HabitLog`
  `completed`) rompe `current_streak` a 0 de inmediato — sin tolerancia
  (ver invariante en [[vision]]).
- Archivar un hábito no borra su historial; solo detiene la generación de
  nuevas ocurrencias y su evaluación de streak.

## Notas de implementación
