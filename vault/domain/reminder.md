---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: ""
---

# Reminder

## Definición

Un horario en el que un [[habit]] debe disparar una notificación push al
[[user]] dueño, recordándole cumplir la ocurrencia programada de ese día.
Un hábito puede tener más de un `Reminder` (ej. mañana y noche).

## Estados

Sin ciclo de vida propio — activo mientras exista; se borra directamente
si el usuario lo elimina.

## Atributos clave

- `time_of_day` — hora local (ej. `08:00`), interpretada siempre en el
  `timezone` del [[user]] dueño del hábito, nunca en UTC directo.

## Relaciones

- N:1 con [[habit]] — un hábito puede tener varios recordatorios; un
  recordatorio pertenece a un único hábito.

## Reglas de negocio

- Un `Reminder` solo dispara notificación en fechas que la
  `recurrence_rule` del [[habit]] marca como programadas — no dispara en
  días donde el hábito no tiene ocurrencia.
- El scheduler backend evalúa `time_of_day` contra el timezone del usuario
  (no el del servidor) para decidir el instante UTC exacto de disparo, y
  despacha a todos los [[device-token]] del usuario.
- Si la ocurrencia del día ya está `completed` en su [[habit-log]] antes de
  la hora del recordatorio, el recordatorio no se envía (evitar recordar
  algo ya cumplido) — comportamiento por defecto, pendiente de confirmar
  al implementar.

## Notas de implementación

`habit_id` como FK obligatoria es una decisión deliberada, no un
descuido: es el seam de extensión más barato para cuando el futuro módulo
de Proyectos (ver [[roadmap]]) necesite recordatorios sobre una `Activity`.
No generalizar a algo tipo `remindable_type/remindable_id` ahora — se
decide con el shape real de `Activity` sobre la mesa, no antes.
