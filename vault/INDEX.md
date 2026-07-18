---
type: index
status: locked
---

# INDEX — Habit Tracker

**Vault**: `C:/Users/Gonzalo/Dev/Habit Tracker/vault`

---

## Sistema

- [[SYSTEM]] — cómo funciona el vault y la sincronización (leer antes de modificar)

---

## Intent — H1 El Porqué

> Visión, invariantes de negocio, reglas que no negocian con la implementación.

- [[vision]] — qué es, para quién, problema que resuelve _(empezar aquí — obligatorio antes del primer feature)_
- [[roadmap]] — evolución futura (módulo Proyectos: Project→Phase→Activity, PMBOK) y su impacto en decisiones actuales de Habit

---

## Domain — H2 El Qué

> Entidades de dominio, sus estados, sus reglas, sus relaciones.

- [[user]] — cuenta, timezone (fuente del corte de "día" para todo el sistema)
- [[category]] — agrupación de hábitos definida por el usuario
- [[habit]] — entidad raíz: tipo de tracking, recurrencia, streak
- [[habit-metric]] — dimensión medible definida por el usuario para un hábito cuantificable (count/duration/currency)
- [[habit-log]] — registro de cumplimiento de una ocurrencia concreta (pending/completed/missed)
- [[habit-metric-log]] — valor logueado de una métrica para una ocurrencia
- [[device-token]] — token push (FCM) de un dispositivo del usuario
- [[reminder]] — horario de notificación push asociado a un hábito

_(plantilla de referencia para nuevas entidades: `domain/entity.md`)_

---

## Decisions — H3 El Cómo

> Decisiones arquitectónicas que propagan hacia H4–H5.

- [[stack]] — tecnologías elegidas por capa _(obligatoria antes del primer feature técnico)_
- [[architecture]] — patrón arquitectónico, convenciones, manejo de errores
- [[api-contracts]] — convenciones de la API REST (auth, envelope, recursos)
- [[environments]] — parametrización vía `.env`, build web vs. mobile (Capacitor), sin hardcodear config
- [[design-system]] — Tailwind v4 + shadcn/ui, tema claro/oscuro, tokens, responsive
- [[i18n-copy]] — 🔒 español neutro EC, tú, prohibido voseo/usted (aplica a toda la app y a este repo)

_(agregar más al tomar decisiones — rbac, deploy, etc.)_

---

## Raw — Fuentes

_(documentos crudos en `raw/` — PDFs, transcripts, imágenes — ingeridos con `/ingest`)_

---

## Tarea → notas obligatorias

| Tarea | Notas obligatorias |
|-------|---------------------|
| Nueva entidad de dominio | `domain/<entidad>.md` (usar `domain/entity.md` como plantilla) + [[architecture]] |
| Nuevo endpoint / ruta API | [[api-contracts]] + `domain/<entidad>.md` involucrada |
| Cambio en tipos de métrica (count/duration/currency) | [[habit-metric]] + [[habit-metric-log]] + [[stack]] |
| Cambio en cálculo de streak o expansión de recurrencia | [[habit]] + [[habit-log]] |
| Cambio en recordatorios / push notifications | [[reminder]] + [[device-token]] + [[stack]] (FCM) |
| Refactor de autenticación / autorización | [[architecture]] (Gestión de auth) + [[vision]] (invariante de aislamiento por usuario) |
| Cambio de stack / librería estructural | [[stack]] + impacto en H4 completo |
| Cambiar URL de API / config de entorno / build mobile vs web | [[environments]] |
| Cualquier texto visible al usuario (UI, error, notificación, email) | [[i18n-copy]] (español neutro EC, tú, sin voseo) |
| Estilos globales, tema claro/oscuro, tokens de color, responsive | [[design-system]] |
| Feature de **Proyectos** (Project/Phase/Activity) | [[roadmap]] primero — no está modelado en H2 todavía |
| Feature cross-entidad (ej. dashboard de estadísticas) | todas las `domain/*.md` involucradas |

---

## Protocolo para agentes

1. Leer este índice antes de cualquier tarea no-trivial.
2. Leer las notas relevantes al área de trabajo (no leer todo el vault).
3. Tras implementar: actualizar `code_path` en la nota correspondiente vía `/sync`.
4. **Nunca modificar** notas con `status: locked`.
5. Si una implementación contradice una nota de dominio → reportar, no resolver.
6. Los snapshots y READMEs son fuentes secundarias — la fuente de verdad
   semántica es este vault.

**Sistema de sincronización**: ver [[SYSTEM]].
