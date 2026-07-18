---
description: Ingiere un documento nuevo de raw/ al grafo semántico del vault
argument-hint: <ruta del archivo en vault/raw/>
---

Esta skill ingiere un documento nuevo a la base de conocimiento. El usuario
agregó un archivo en `vault/raw/` (PDF, txt, imagen, etc.) y se quiere
extraer su contenido semántico al grafo.

## Pasos

1. **Leer el archivo** indicado en el argumento (ruta relativa al vault).
2. **Identificar el tipo de información**:
   - ¿Es contexto de negocio? → relevante a `intent/` o `domain/`
   - ¿Es decisión técnica externa? → relevante a `decisions/`
   - ¿Es referencia o material de soporte? → puede quedarse solo en `raw/`
3. **Leer el `INDEX.md` y las notas relevantes** ya existentes para no duplicar
   información.
4. **Extraer entidades, reglas y relaciones**:
   - ¿Hay nuevas entidades de dominio?
   - ¿Hay reglas que contradicen reglas existentes?
   - ¿Hay decisiones implícitas que merecen una nota `decisions/`?
5. **Proponer operaciones** en `.vault-sync/proposed-changes.json`:
   - `create` para conceptos nuevos (usar los templates `*.md.tpl` como base)
   - `append_section` para enriquecer notas existentes
   - **Nunca** `deprecate` automáticamente; eso es decisión del usuario.
     `ingest` solo agrega.
6. **Reportar contradicciones encontradas** al usuario explícitamente — sin
   resolverlas, solo señalarlas.
7. **Resumir y pedir aprobación** antes de aplicar.

## Reglas estrictas

- No tocar notas `locked`.
- Si el documento parece reescribir una regla existente → reportarlo como
  contradicción, no como `update`.
- Mantener los enlaces wiki (`[[nota]]`) consistentes con las notas que existen
  en el vault.

## Nota sobre Graphify

Para PDFs técnicos extensos y documentos externos densos, Graphify Pass 3
(con flags de LLM activas) puede ser una alternativa: extrae entidades,
diagramas y rationale como nodos del grafo en lugar de notas del vault.

**`/ingest` sigue siendo el camino canónico** porque produce notas
estructuradas con `status`, `code_path` y wikilinks. Graphify produce nodos
de grafo — útiles para queries, no para el contrato semántico que el sistema
vault-sync mantiene.

Si Graphify ya está corriendo y se quiere combinar ambos:
- Dejar los PDFs en `vault/raw/` y ejecutar `/ingest` (path canónico).
- Si además se quiere que Graphify los conozca para queries, ejecutar:
  ```
  graphify extract . --no-cluster
  ```
  (sin `--no-cluster` si se quieren clusters, con flags adicionales para Pass 3.)
