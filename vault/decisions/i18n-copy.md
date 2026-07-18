---
status: locked
type: decision
layer: H3
created: 2026-07-17
---

# Idioma y copy — Habit Tracker

## Regla (no negociable)

Todo texto en español de este proyecto — UI, mensajes de error/validación,
notificaciones push, emails, texto de la API (`mensaje` en
[[api-contracts]]), y la documentación del propio repo (vault, `AGENTS.md`,
`USAGE.md`, commits en español si aplica) — usa **español neutro,
registro Ecuador**, conjugación de **tú** (tienes, puedes, ingresa,
activa).

**Prohibido**:
- Voseo argentino: "vos", "tenés", "podés", "ingresá", "activá", "corré",
  "leé", "pedís", "sos", etc.
- "Usted" — salvo que un texto puntual ya haya establecido ese tono
  deliberadamente (no es el caso por defecto en ningún lugar de esta app).

## Por qué

Regla explícita y repetida del usuario, ya establecida como permanente en
otro proyecto con el mismo perfil de usuario (Ecuador) — ver precedente en
memoria de `financehub` (`feedback-spanish-locale`): se encontró voseo
esparcido por formularios, coach marks, notificaciones push, emails y
mensajes de asistente, y se marcó como regla permanente, no corrección
puntual. Se aplica acá desde el inicio del proyecto para no repetir esa
auditoría tardía.

## Cómo aplicar

- Al escribir o revisar **cualquier** string visible para el usuario
  (placeholder, error, toast, notificación push, email, texto de botón,
  copy de onboarding): verificar que no tenga voseo ni "usted" antes de
  darlo por terminado.
- Preferir imperativo de "tú" para instrucciones de UI ("Completa tu
  hábito", no "Completá tu hábito" ni "Complete su hábito").
- `APP_LOCALE=es` en el backend (ver [[environments]]) — no dejar el
  default `en` del skeleton de Laravel.
- Si aparece código nuevo con voseo (propio o copiado de otro proyecto de
  referencia como FarMedic — que sí tiene voseo en su propio copy), se
  corrige en el mismo diff, sin esperar a que se reporte de nuevo.
- Esta nota es `locked` — es una regla de producto, no una decisión técnica
  que deba renegociarse por conveniencia de implementación.
