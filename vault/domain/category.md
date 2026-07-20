---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: app/backend/app/Models/Category.php
---

# Category

## Definición

Una agrupación temática que un [[user]] define para organizar sus
[[habit]] (ej. "Salud", "Trabajo", "Aprendizaje"). Es propia de cada
usuario — no hay categorías globales ni compartidas.

## Estados

Sin ciclo de vida — existe o no existe (borrado directo, no hay archivado).

## Atributos clave

- `name` — obligatorio.
- `color` — opcional, solo para distinguir visualmente en la UI; sin
  regla de negocio asociada.

## Relaciones

- N:1 con [[user]] — pertenece a un único usuario.
- 1:N con [[habit]] — una categoría agrupa muchos hábitos; un hábito
  pertenece a **una sola** categoría (o ninguna). Etiquetado múltiple
  (tags N:M) está fuera de alcance del MVP (ver [[vision]]).

## Reglas de negocio

- Borrar una categoría con hábitos asociados no borra los hábitos — los
  deja sin categoría (`category_id = null`). Decidido: el borrado nunca
  se bloquea por tener hábitos asociados.

## Notas de implementación

`CategoryController` (`app/backend/app/Http/Controllers/Api/V1/CategoryController.php`)
implementa CRUD completo; `destroy` borra la categoría sin bloquear
(`habits.category_id` queda `null` vía `nullOnDelete()` en la FK, ver
[[habit]] → Notas de implementación).
