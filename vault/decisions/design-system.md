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
  **Paleta de marca de Habit Tracker: pendiente de definir** — placeholder
  hasta que se defina identidad visual.
- Charts: `chart-1` … `chart-N` — necesario desde el MVP porque
  [[vision]] incluye estadísticas/streaks con gráficos. Ver skill
  `dataviz` al momento de implementar para la metodología de paleta
  categórica/secuencial — los tokens acá son el mecanismo de inyección
  (CSS vars), no la elección de colores en sí.
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

## Decisiones pendientes

- [ ] Paleta de marca (colores `brand`/`primary` concretos) — placeholder
  hasta definir identidad visual de Habit Tracker.
- [ ] Mecanismo de safe-area para Capacitor (plugin vs. CSS manual).
- [ ] Set de iconos: FarMedic usa `lucide-react` (vía `iconLibrary: "lucide"`
  en `components.json`) — adoptar el mismo por consistencia salvo razón en
  contra.
