---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: ""
---

# HabitLog

## Definición

El registro de cumplimiento de un [[habit]] para **una fecha de ocurrencia
concreta** — la unidad atómica sobre la que se calcula el streak. Cada
fecha en que un hábito "está programado" (según su `recurrence_rule`, ver
[[habit]]) tiene, como mucho, un `HabitLog`.

## Estados

- `pending` — la ocurrencia está programada para hoy (o una fecha futura
  aún no cerrada) y todavía no se completó.
- `completed` — para un hábito `binary`: se hizo check-off. Para uno
  `quantifiable`: todas sus [[habit-metric]] alcanzaron el `target_value`
  vía sus [[habit-metric-log]] de esta ocurrencia.
- `missed` — el día de la ocurrencia cerró (terminó, según el `timezone`
  del [[user]]) sin que el log llegara a `completed`. Estado terminal.

## Atributos clave

- `occurrence_date` — fecha de calendario (en el timezone del usuario) que
  este log representa. Junto con `habit_id`, es **único** — invariante
  documentada en [[vision]].
- `completed_at` — timestamp de cuándo se marcó `completed` (nulo si no).

## Relaciones

- N:1 con [[habit]].
- 1:N con [[habit-metric-log]] — solo si el hábito es `quantifiable`; un
  valor logueado por cada [[habit-metric]] del hábito, para esta
  ocurrencia.

## Reglas de negocio

- `habit_id` + `occurrence_date` es una combinación única — crear un log
  duplicado para la misma ocurrencia es un error (422), no un upsert
  silencioso (ver [[api-contracts]]).
- El streak (`current_streak` en [[habit]]) es la cuenta de ocurrencias
  consecutivas `completed` terminando en la más reciente evaluada. El
  primer `missed` en la secuencia la resetea a 0 — sin tolerancia (ver
  invariante en [[vision]]).
- Un log solo pasa a `missed` cuando el día de su `occurrence_date` ya
  cerró en el timezone del usuario — nunca antes, para no penalizar al
  usuario mientras el día todavía está en curso.

## Notas de implementación
