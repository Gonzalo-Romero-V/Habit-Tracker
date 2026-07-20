---
status: draft
type: decision
layer: H3
created: 2026-07-17
---

# Design System — Habit Tracker

## Qué

Cómo se organizan estilos globales, tema claro/oscuro y responsive en el
frontend Next.js. Mecanismo adaptado de FarMedic (mismo stack: Next.js +
Tailwind v4 + shadcn/ui) — se reusa el **patrón**, no la marca (colores de
FarMedic son de su propio dominio farmacéutico; Habit Tracker define su
propia paleta).

## Tailwind v4 + shadcn/ui

- `components.json` de shadcn con `cssVariables: true`, `baseColor:
  "neutral"`, sin prefijo de clases, alias `@/components`, `@/lib`,
  `@/hooks` (mismos alias que usa el resto de la convención de
  [[architecture]]).
- Todos los tokens de color viven como variables CSS en `app/globals.css`,
  **no** hardcodeados en clases Tailwind sueltas (nunca `bg-[#14A67C]` en
  un componente — siempre `bg-primary`, `bg-brand`, etc., para que el
  cambio de tema los actualice solos).
- Espacio de color: **OKLCH** (no HSL/RGB) — mejor percepción de contraste
  uniforme entre tonos, más fácil de ajustar sistemáticamente luz/dark sin
  que un color "se sienta" desbalanceado contra otro.

## Tokens semánticos (mecanismo, no valores finales)

Set mínimo a definir en `:root` (light) y `.dark` (dark), espejado 1:1 —
**por cada token en light debe existir su contraparte en dark**, nunca dejar
uno sin definir (shadcn lo asume, un token faltante rompe silenciosamente
en un tema):

- Base: `background`, `foreground`, `card`, `popover`, `border`, `input`, `ring`.
- Semánticos de acción: `primary`, `secondary`, `muted`, `accent`, `destructive`
  (+ sus `-foreground` correspondientes para contraste de texto).
- Brand: `brand`, `brand-foreground` (uso explícito en vez de heredado —
  para casos donde se necesita EL color de marca, no "el color primario").
  **Resuelto** a partir del proyecto de diseño `Diseño Habit Tracker App`
  (Claude Design, importado 2026-07-20): paleta cálida tipo "papel", no
  neutra gris — fondo con tinte crema/beige (hue ~55-75 en OKLCH),
  `primary` teal-azulado (hue ~205, para acciones/foco), `gold` como
  acento de marca para rachas y CTAs destacados (hue ~78-80). Tipografía:
  `Lora` (serif, headings/marca) + `Plus Jakarta Sans` (sans, cuerpo).
  Valores concretos (mismo esquema en `:root` light y `.dark`):

  | Token | Light | Dark |
  |---|---|---|
  | `background` | `oklch(97% 0.016 75)` | `oklch(19% 0.016 55)` |
  | `card` | `oklch(99% 0.008 75)` | `oklch(24% 0.018 55)` |
  | `card` (alt) | `oklch(95% 0.018 75)` | `oklch(21% 0.017 55)` |
  | `border` | `oklch(89% 0.02 70)` | `oklch(32% 0.02 60)` |
  | `foreground` | `oklch(26% 0.02 55)` | `oklch(93% 0.015 70)` |
  | `foreground` (soft) | `oklch(45% 0.02 55)` | `oklch(75% 0.015 65)` |
  | `muted-foreground` | `oklch(56% 0.015 60)` | `oklch(60% 0.015 60)` |
  | `primary` | `oklch(46% 0.09 205)` | `oklch(68% 0.10 205)` |
  | `primary` (soft/bg) | `oklch(93% 0.03 200)` | `oklch(30% 0.05 200)` |
  | `primary-foreground` | `oklch(98% 0.01 205)` | `oklch(14% 0.02 205)` |
  | `brand` (gold) | `oklch(60% 0.13 78)` | `oklch(78% 0.13 80)` |
  | `brand` (soft/bg) | `oklch(94% 0.05 80)` | `oklch(32% 0.06 75)` |
  | `destructive` | `oklch(58% 0.13 30)` | `oklch(68% 0.14 30)` |
  | `destructive` (soft/bg) | `oklch(93% 0.04 35)` | `oklch(30% 0.06 30)` |

  Colores de [[category]] (swatches predefinidos, no hex libre en el
  formulario): hues `150` (salud/verde), `320` (mente/magenta), `250`
  (trabajo/azul), `55` (hogar/ámbar), `30`, `190` — todos
  `oklch(56% 0.11 <hue>)`, mismo lightness/chroma, solo cambia el hue
  (consistencia visual entre categorías).
- Charts: `chart-1` … `chart-N` — necesario desde el MVP porque
  [[vision]] incluye estadísticas/streaks con gráficos. Paleta de
  heatmap (calendario/Memento Mori) resuelta como escala secuencial de 5
  pasos sobre `primary`→`gold` según score (bajo→excelente), más un tono
  "sin registro" neutro — ver `user-daily-stat` en [[api-contracts]]
  para de dónde sale el dato. Los tokens acá son el mecanismo de
  inyección (CSS vars), no la elección de colores en sí.
- Radios: escala derivada de un único `--radius` (`--radius-sm` …
  `--radius-3xl` como `calc()` del base) — cambiar un valor ajusta toda la
  escala.
- Tipografía semántica: `--font-h1` … `--font-small`, `--font-*-weight`,
  `--line-*` como variables, no clases `text-4xl font-bold` repetidas por
  todo el código — un componente `<Heading level={1}>` (o equivalente)
  consume las variables.

## Tema claro/oscuro

- Librería: `next-themes`, estrategia `attribute="class"` (agrega/quita
  `.dark` en `<html>`), con soporte a `system` (respeta preferencia del
  SO) además de `light`/`dark` explícitos.
- Toggle: usar `document.startViewTransition()` para un crossfade suave
  del cambio de tema, con fallback silencioso (`setTheme` directo) en
  navegadores sin soporte — **no** aplicar transiciones CSS globales sobre
  `*` (más lento, afecta hovers/interacciones no relacionadas al cambio de
  tema).
- Evitar flash de hidratación: el toggle debe renderizar un placeholder
  deshabilitado hasta que el componente esté `mounted` en cliente (el
  tema real solo se conoce después de la hidratación).

## Responsive

- Mobile-first: estilos base apuntan al viewport más chico (relevante acá
  más que en un dashboard típico — Habit Tracker se usa mayormente desde
  el shell mobile de Capacitor), progresivamente ajustados con los
  breakpoints estándar de Tailwind (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) —
  sin breakpoints custom salvo necesidad concreta y documentada.
- Safe-area de dispositivos con notch/gesture-bar (relevante en el shell
  Capacitor iOS/Android): usar `env(safe-area-inset-*)` vía utilidades
  Tailwind o CSS directo en el layout raíz — pendiente de confirmar el
  mecanismo exacto al implementar (plugin de Tailwind vs. CSS manual).

## Estructura de componentes (frontend)

Convención fija para `app/frontend/src/components/`:

- **`components/ui/`** — primitivas generadas por el CLI de shadcn/Radix
  (`npx shadcn add <componente>`). Nunca se editan a mano más allá de
  ajustar clases puntuales — la personalización real pasa por las
  variables de `globals.css` (`bg-primary`, `bg-brand`, `text-muted-foreground`,
  etc.), nunca hardcodeando un color o tamaño. **Regla de instalación**:
  nunca instalar de una el catálogo completo de shadcn — se agrega un
  componente recién cuando una página concreta lo necesita.
- **`components/custom/`** — componentes propios del dominio: construidos
  desde cero o componiendo primitivas de `ui/` (ej. `HabitCard`,
  `StreakBadge`). Acá vive toda la UI reutilizable específica de Habit
  Tracker que no es una primitiva genérica.
- **`components/layout/`** — componentes de estructura de página (header,
  aside/nav, y similares). **Regla dura**: las variantes mobile y desktop
  viven en archivos separados (`XDesktop.tsx` / `XMobile.tsx`), nunca un
  `if (isMobile)`/hook de viewport ramificando JSX condicional — la
  visibilidad se resuelve con clases responsive de Tailwind
  (`hidden md:flex` en la variante desktop, `flex md:hidden` en la
  mobile). Un barrel `index.tsx` en cada subcarpeta renderiza ambas
  variantes juntas; el navegador decide cuál mostrar vía CSS, sin JS de
  por medio (evita mismatches de hidratación y mantiene cada variante
  legible por separado). Precedente: mismo patrón usado en proyectos
  previos con este stack (FarMedic, financehub) — **nota**: esta regla se
  documentó sin acceso al código de esos repos en esta sesión; es una
  propuesta razonada a partir del principio ("no inundar de ifs"), no una
  copia verificada. Ajustar si el precedente real difiere.
  - Decisión concreta para Habit Tracker: `aside/AsideDesktop.tsx` es una
    barra lateral fija (sidebar); `aside/AsideMobile.tsx` es una barra de
    tabs fija abajo (`fixed inset-x-0 bottom-0`), consciente de
    `env(safe-area-inset-bottom)` (ver "Responsive" más abajo) — patrón
    estándar de navegación mobile para una app de tracking diario.

## Estrategia de layouts (route groups de Next.js)

Carpetas `(nombre)` bajo `src/app/` agrupan páginas bajo un layout
compartido **sin afectar la URL** (no aparecen en la ruta):

- `src/app/layout.tsx` (raíz) — **solo** `<html>/<body>`, fuentes y
  providers globales (tema claro/oscuro, etc.). Nunca UI de navegación acá.
- `src/app/(auth)/layout.tsx` — pantallas sin sesión (login, registro):
  layout centrado, sin `Header` ni `Aside`.
- `src/app/(app)/layout.tsx` — shell autenticado: envuelve con `Aside` +
  `Header` (ver `components/layout/`) y el `<main>` de contenido. Todas
  las páginas reales de la app (`habits`, `categories`, `stats`, etc.)
  van dentro de este grupo cuando se creen.
- Regla general: un nuevo grupo de rutas se crea cuando un conjunto de
  páginas necesita un layout visualmente distinto al de los grupos
  existentes — no antes, no "por si acaso".

## Decisiones pendientes

- [x] ~~Paleta de marca~~ — resuelta arriba a partir del proyecto de
  diseño (2026-07-20).
- [x] ~~Mecanismo de safe-area~~ — resuelto: CSS manual
  (`env(safe-area-inset-*)` inline en los estilos del layout), no plugin
  de Tailwind — así lo usa el proyecto de diseño importado.
- [ ] Set de iconos: FarMedic usa `lucide-react` (vía `iconLibrary: "lucide"`
  en `components.json`) — el diseño importado usa SVG inline a mano, no
  una librería de iconos. Adoptar `lucide-react` de todos modos por
  consistencia con el resto del stack (los SVG del diseño son fáciles de
  mapear 1:1 a sus equivalentes de `lucide-react`).
