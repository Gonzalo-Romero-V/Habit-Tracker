---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: ""
---

# HabitMetric

## Definición

Una dimensión medible que el propio [[user]] define para un [[habit]]
`quantifiable`. Un hábito puede tener varias métricas simultáneas — ej.
para "leer un libro": una métrica "Tiempo de lectura" (duración) y otra
"Páginas leídas" (conteo). No es un campo genérico único: cada métrica
tiene un **tipo** que determina cómo se almacena, se agrega y se muestra.

## Estados

Sin ciclo de vida propio — existe mientras el hábito `quantifiable` exista.

## Atributos clave

- `name` — nombre definido por el usuario (ej. "Vasos de agua", "Tiempo de
  meditación", "Gasto en salidas").
- `metric_type` ∈ `{count, duration, currency}` — **no todo es un número
  genérico**:
  - `count` — cantidad simple con una `unit` de texto libre definida por el
    usuario (ej. "páginas", "vasos", "km"). Se almacena como
    entero/decimal.
  - `duration` — se almacena **siempre en segundos** (entero). La UI la
    formatea como HH:MM o "20 min" — nunca se persiste ni se serializa en
    la API como minutos/horas ambiguos.
  - `currency` — se almacena en **unidades mínimas** (centavos, entero) +
    un código ISO 4217 (`currency_code`). Nunca como float — evita errores
    de redondeo.
- `target_value` — la meta que debe alcanzar cada [[habit-metric-log]] de
  una ocurrencia para que esa métrica cuente como cumplida ese día.

## Relaciones

- N:1 con [[habit]] — pertenece a un único hábito `quantifiable`.
- 1:N con [[habit-metric-log]] — un valor logueado por ocurrencia de
  [[habit-log]].

## Reglas de negocio

- `metric_type` es inmutable una vez creada la métrica (cambiar de
  `duration` a `count`, por ejemplo, invalidaría el historial de
  [[habit-metric-log]] ya almacenado en segundos).
- El MVP evalúa `target_value` **por ocurrencia individual**, no como
  acumulado agregado de un rango de fechas (ver "Fuera de alcance" en
  [[vision]]).

## Notas de implementación
