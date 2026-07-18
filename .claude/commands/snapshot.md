---
description: Captura el estado actual del repositorio y propone notas iniciales del vault
---

Esta skill ejecuta el snapshot inicial del proyecto: captura el estado
actual del código y propone (sin aplicar) las notas que faltan en el vault
para que el grafo refleje fielmente la realidad del repo.

## Antes de leer cualquier archivo de código

1. **Verificar si `graphify-out/graph.json` existe.**
   - Si existe: usarlo como mapa estructural. Leer sus primeras ~200 líneas
     con la herramienta nativa de lectura (no asumir `cat`/`head` — el repo
     puede estar en Windows sin Git Bash). Si Graphify está expuesto como
     MCP server, usarlo. Empezar por el grafo evita re-leer archivos raw
     que Graphify ya parseó deterministicamente.
   - Si no existe: proceder con lectura directa (comportamiento por defecto).

## Pasos

1. **Leer `vault_sync.config.json`** para conocer el `vault_path`, el extractor
   activo, y el `hierarchy_mapping`.
2. **Generar el reporte y los facts** ejecutando:
   ```
   python scripts/vault_sync.py report
   ```
   Esto produce `.vault-sync/change_report.json` y `.vault-sync/facts.json`.
3. **Leer `.vault-sync/facts.json`** primero — tiene la extracción semántica
   del repo, qué exactamente depende del extractor activo:
   - `nextjs-laravel`: `frontend.{shadcn, ui_primitives, theme, package, pages}`,
     `backend.{models, migrations, routes, controllers}`, `import_graph`.
   - `python-generic`: `sqlalchemy_models`, `pydantic_schemas`, `alembic_migrations`,
     `routes`, `django.apps` (si aplica), `import_graph`.
   - `graphify`: `node_count`, `edge_count`, `import_graph`, `call_graph`, `layers`.
   - `generic`: `detected_stack`, `import_graph`, `layers`, posiblemente `proposed_files`
     (scaffolds para promover al catálogo — informarlo al usuario).
   - Cualquiera: `layers.H4`, `layers.H5`, `env_references`.
4. **Leer el `INDEX.md` actual** del vault y las notas existentes (`intent/`,
   `domain/`, `decisions/`). No leer el vault completo — solo lo que ya hay.
5. **Mapear código → vault**:
   - Para cada entidad/módulo H4 detectado en `facts.json`, identificar si ya
     existe una nota de dominio que lo describa.
   - Si existe → proponer actualizar `code_path` en su frontmatter.
   - Si no existe pero el archivo representa un concepto del dominio →
     proponer crear una nueva nota usando `domain/entity.md.tpl` como base.
6. **Identificar gaps**:
   - Variables en `facts.env_references` sin documentación en `decisions/`.
   - Decisiones técnicas implícitas (qué stack se usa, qué patrones) sin
     reflejo en `decisions/stack.md` o `decisions/architecture.md`.
   - Entidades en `H4` sin nota domain correspondiente.
7. **Producir `.vault-sync/proposed-changes.json`** con operaciones tipo:
   ```json
   {
     "operations": [
       {"action": "update_frontmatter", "note": "domain/<entidad>.md",
        "set": {"code_path": "src/models/<entidad>.py"}},
       {"action": "create", "path": "domain/<nueva>.md", "content": "..."}
     ]
   }
   ```
8. **Mostrar el resumen al usuario** y pedir aprobación antes de ejecutar:
   ```
   python scripts/vault_sync.py apply .vault-sync/proposed-changes.json
   ```

## Reglas estrictas

- **Nunca** modificar notas con `status: locked` (típicamente `SYSTEM.md` e `INDEX.md`).
- **Nunca** borrar una nota; usar `deprecate` si está obsoleta.
- Si una propuesta contradice una nota `locked`, detenerse y reportar la
  contradicción al usuario.
- **No leer el vault completo de golpe** — usar el report y las notas relevantes.
- Si el extractor es `generic` y aparecen `proposed_files` en facts.json, el
  primer ítem del resumen debería ser: "Stack `<X>` detectado sin archetype;
  scaffolds escritos en _proposed_*. Revisar antes de promover."
