---
status: draft
type: intent
layer: H1
created: 2026-07-17
---

# Roadmap — Habit Tracker

## Qué es esta nota

Habit Tracker es el primer módulo de una plataforma personal que, con el
tiempo, va a incorporar **Proyectos**. Esta nota captura la intención
conceptual de esa expansión **antes de modelarla en H2** — el objetivo es
que ninguna decisión del MVP de Hábitos cierre una puerta que después haya
que forzar. El modelado detallado (entidades, estados, endpoints) de
Proyectos queda fuera de esta sesión; se hace cuando el módulo se aborde en
serio.

## Visión conceptual de "Proyecto" (futuro, no implementado)

Un **Proyecto** es una meta u objetivo, con plazo opcional y ajustable, que
se descompone jerárquicamente al estilo WBS (Work Breakdown Structure) de
PMBOK:

```
Project (meta/objetivo, deadline opcional y ajustable)
  └─ Phase (agrupación intermedia, N por proyecto)
       └─ Activity (unidad atómica ejecutable, N por fase)
```

- **Activity** es la unidad atómica — mismo nivel de "unicidad" que un
  [[habit]] (algo ejecutable, con estado propio), pero con una diferencia
  central: un hábito es la **misma** actividad repetida cíclicamente
  (diaria/semanal) y su cumplimiento se mide contra métricas por
  ocurrencia; una actividad de proyecto **no es necesariamente cíclica**
  (aunque podría serlo) — es un peldaño hacia el objetivo del proyecto, se
  hace una vez (o un número acotado de veces) y avanza.
- El plazo (`deadline`) existe a nivel Project, y probablemente también a
  nivel Phase/Activity, pero siempre **opcional y ajustable** — no es un
  baseline rígido tipo Gantt clásico. Investigar PMBOK (Schedule
  Management) al momento de modelar esto en serio, en particular:
  dependencias entre actividades (predecessor/successor), hitos
  (milestones, actividades de duración cero que marcan un punto
  significativo), y si vale la pena methods de estimación de duración o
  alcanza con fechas simples ajustables a mano.
- Estado de una Activity/Phase/Project: previsiblemente algo tipo
  `not_started | in_progress | completed | blocked`, **no** el modelo
  `pending/completed/missed` de [[habit-log]] — son dominios distintos, no
  se debe forzar el mismo enum.

## Qué significa esto para el modelo actual de Habit (decisiones tomadas AHORA)

Regla general acordada: **nombrar específico en el MVP de Hábitos, no
generalizar prematuramente** — no existe todavía suficiente conocimiento
del shape real de Proyecto/Actividad como para diseñar una abstracción
compartida sin arriesgarse a adivinar mal. Revisado el modelo actual
entidad por entidad:

- [[user]] y [[device-token]] — ya son agnósticos de Habit (no tienen
  ninguna referencia a `habit_id`). No requieren cambios cuando llegue
  Proyectos.
- [[category]] — ya es agnóstica: no tiene FK a `habit_id`; es
  [[habit]] quien tiene `category_id`. El día que exista `Project`, puede
  sumar su propio `category_id` apuntando a la misma tabla `categories`
  sin tocar `Category`.
- [[reminder]] — **es el único punto acoplado a Habit hoy**
  (`habit_id` obligatorio). Es un seam deliberado, no un descuido — ver
  nota en [[reminder]] → "Notas de implementación". Cuando Activity
  necesite recordatorios, resolver ahí (opción barata: columna hermana
  `activity_id` nullable; opción más limpia pero más cara: generalizar a
  `remindable_type/remindable_id`). No decidir ahora sin conocer el
  volumen real de uso.
- El streak/racha de [[habit]] es un concepto exclusivamente cíclico — no
  hay intención de reusarlo para Proyecto/Actividad (que se mide por
  avance/estado, no por racha consecutiva).

## Fuera de esta nota

Esta nota es intención (H1), no diseño (H2/H3). No crear
`domain/project.md`, `domain/phase.md` ni `domain/activity.md` todavía —
eso se hace en la sesión donde Proyectos se aborde de verdad, con el mismo
nivel de preguntas y precisión que se usó para modelar Habit.
