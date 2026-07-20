---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: ""
---

# HabitLog

## Definición

El registro de cumplimiento de un [[habit]] para **una fecha concreta** —
la unidad atómica sobre la que se calcula el streak. Su origen difiere
según el `recurrence_type` del hábito (ver [[habit]]):

- **`fixed`**: la fecha viene pre-determinada — un Service expande la
  `recurrence_rule` a fechas de ocurrencia programadas, y cada una tiene,
  como mucho, un `HabitLog`.
- **`quota`**: no hay fechas pre-determinadas — el `HabitLog` se crea
  directamente el día que el usuario registra cumplimiento (fecha
  auto-seleccionada, cualquier día dentro del `quota_period` en curso).

## Estados

- `pending` — **solo aplica a `fixed`**: la ocurrencia está programada
  para hoy (o una fecha futura aún no cerrada) y todavía no se completó.
  En `quota` no existe este estado — no hay ocurrencia pre-programada
  esperando; el log nace cuando el usuario efectivamente registra algo.
- `completed` — para un hábito `binary`: se hizo check-off. Para uno
  `quantifiable`: todas sus [[habit-metric]] alcanzaron el `target_value`
  vía sus [[habit-metric-log]] de esta ocurrencia. En `quota`, un
  `HabitLog` nace directamente en este estado (no pasa por `pending`).
- `missed` — **solo aplica a `fixed`**: el día de la ocurrencia cerró
  (terminó, según el `timezone` del [[user]]) sin que el log llegara a
  `completed`. Estado terminal. En `quota` no existe `missed` a nivel de
  `HabitLog` individual — "no llegar a la cuota" es un hecho del *período*
  (ver [[habit]] → Reglas de negocio), no de un día puntual; no genera una
  fila de `HabitLog`, se calcula al cerrar el período.

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
  duplicado para la misma fecha es un error (422), no un upsert silencioso
  (ver [[api-contracts]]). Aplica igual en `fixed` y en `quota`: **un
  hábito `quota` admite como máximo un `HabitLog` por día** — dos
  cumplimientos el mismo día no cuentan doble hacia `quota_target`. Es una
  simplificación deliberada del MVP (evita ramificar el schema); si hace
  falta contar múltiples cumplimientos por día, es una revisión futura.
- **Streak en `fixed`**: cuenta de ocurrencias consecutivas `completed`
  terminando en la más reciente evaluada. El primer `missed` en la
  secuencia la resetea a 0 — sin tolerancia (ver invariante en [[vision]]).
  Un log solo pasa a `missed` cuando el día de su `occurrence_date` ya
  cerró en el timezone del usuario — nunca antes.
- **Streak en `quota`**: no se mide por `HabitLog` individual sino por
  período. Un período (semana ISO, en el timezone del usuario) cuenta como
  cumplido cuando el número de `HabitLog` `completed` con `occurrence_date`
  dentro de esa semana alcanza `quota_target` del [[habit]]. El streak es
  la cuenta de períodos consecutivos cumplidos; el primer período que
  cierra sin alcanzar la cuota lo resetea a 0. Un período solo se evalúa
  como "no cumplido" cuando la semana ya cerró — nunca antes.

## Notas de implementación

Las ocurrencias `pending` de un hábito `fixed` se **pre-generan por mes
calendario real** (no ventana rodante de 30 días): un job mensual, al
cierre de cada mes (evaluado en el timezone de cada [[user]]), expande la
`recurrence_rule` del hábito y materializa de una vez las filas `pending`
del mes siguiente completo. Ese mismo job es el punto donde se consolidan
las estadísticas del mes que acaba de cerrar (ver
[[habit-monthly-stat]]) — generación de ocurrencias y consolidación de
stats son la misma operación mensual, no dos jobs separados.

Los `HabitLog` individuales **nunca se purgan ni se resumen** — la
consolidación mensual es una tabla-cache de agregados derivada, siempre
recalculable desde el detalle. El streak sigue derivándose del historial
completo de `HabitLog`, nunca de los agregados mensuales (ver invariante
en [[vision]]).

Un `HabitLog` admite borrado físico (deshacer un check-off), no solo
`create`/`update`. Borrar un log libera la combinación única
`habit_id`+`occurrence_date` (puede volver a registrarse) y obliga a
re-evaluar el streak/período afectado, igual que si nunca se hubiera
completado.
