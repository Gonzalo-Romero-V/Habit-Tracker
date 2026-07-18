---
status: draft
type: decision
layer: H3
created: 2026-07-17
---

# Environments — Habit Tracker

## Qué

Cómo el código soporta desarrollo local, distintos entornos de despliegue,
y los dos targets de build del frontend (web / mobile-Capacitor) **sin que
el código cambie** — solo variables de entorno. Patrón adaptado de
proyectos previos con el mismo stack (FarMedic, financehub), no inventado
desde cero.

## Por qué

Pedido explícito del proyecto: modularidad desde el día uno, cambiar de
entorno (localhost ↔ staging ↔ producción) o de target (web ↔ mobile) debe
ser cuestión de variables de `.env`, nunca de tocar código fuente.

## Backend (Laravel)

- Todo valor configurable vive en `.env` / `.env.example`, leído **solo**
  desde archivos de `config/*.php` vía `env()`. **Regla dura**: nunca
  llamar `env()` fuera de `config/` (controllers, services, models) —
  `php artisan config:cache` en producción cachea el resultado de
  `config/*.php` y cualquier `env()` llamado fuera de ahí devuelve `null`
  silenciosamente después de cachear. Usar siempre `config('app.name')`,
  nunca `env('APP_NAME')` en código de aplicación.
- `APP_LOCALE=es` explícito en `.env.example` (no dejar el default `en` del
  skeleton de Laravel — ver [[i18n-copy]]).
- `.env` nunca se commitea (ya está en `.gitignore` del template);
  `.env.example` se mantiene sincronizado con cada variable nueva que se
  agregue — es lo que `vault_sync.py check` audita (`env_references`).
- Credenciales de Firebase (server-side, para disparar push) van como
  variables `FIREBASE_*` en `.env`, nunca hardcodeadas ni commiteadas.

## Frontend (Next.js) — build web vs. build mobile

Mismo codebase, dos scripts de build, decidido por una env var:

- **Build web** (`npm run build`): Next.js corre con servidor (o se
  despliega como tal). Usa `rewrites()` en `next.config.ts` para proxear
  `/api/:path*` hacia `BACKEND_URL` (server-only, **sin** prefijo
  `NEXT_PUBLIC_`, nunca expuesta al browser). El cliente solo llama rutas
  relativas (`/api/...`) — evita CORS y evita hardcodear el host del
  backend en el bundle del browser. En local, `BACKEND_URL` default a
  `http://localhost:8000`.
- **Build mobile** (`npm run build:mobile`, con `BUILD_TARGET=mobile`):
  Next.js corre con `output: 'export'` — export estático, porque el
  bundle se empaqueta dentro del shell nativo de Capacitor y ahí **no hay
  servidor Next.js corriendo**, por lo tanto no hay `rewrites()` posibles.
  El cliente en este build llama directo a una URL **absoluta** de la API
  de producción, leída de `NEXT_PUBLIC_API_URL` (con prefijo, porque acá sí
  queda embebida en el bundle a propósito — no hay proxy que la oculte).
- Ambos builds comparten el mismo código de componentes/hooks; lo único
  que cambia es *cómo* se resuelve la URL base de la API (relativa+proxy
  vs. absoluta+embebida), nunca la lógica de negocio ni los componentes.

```ts
// next.config.ts — shape de referencia (no es código final, es la decisión)
const isMobileBuild = process.env.BUILD_TARGET === "mobile";
export default isMobileBuild
  ? { output: "export", images: { unoptimized: true } }
  : { async rewrites() { return [{ source: "/api/:path*", destination: `${process.env.BACKEND_URL}/api/:path*` }]; } };
```

- Token de autenticación (Sanctum Bearer): se guarda en `localStorage` en
  ambos builds — el WebView de Capacitor persiste `localStorage` por app
  igual que un browser, así que no hace falta un mecanismo de storage
  distinto para mobile en el MVP.

## Limitación conocida: Capacitor + `localhost`

Un emulador/dispositivo físico corriendo la app empaquetada **no puede
resolver `localhost` como la máquina de desarrollo** — `localhost` dentro
del emulador apunta al propio emulador. Para probar el build mobile contra
un backend local hace falta:

- Usar la IP LAN de la máquina de desarrollo (`http://192.168.x.x:8000`)
  en `NEXT_PUBLIC_API_URL` en vez de `localhost`, o
- Un túnel (ngrok, Cloudflare Tunnel) apuntando al backend local.

Esto no es un bug a resolver — es una limitación de red inherente a probar
una app nativa contra un backend en la misma máquina; documentarlo evita
perder tiempo re-descubriéndolo.

## Reglas

- Ningún valor de entorno (URL de API, credenciales, feature flags) se
  hardcodea en código fuente — ni siquiera como "default temporal"; los
  defaults viven en `.env.example` con un valor de desarrollo razonable.
- Cualquier variable de entorno nueva se agrega primero a `.env.example`
  (documentada con un comentario de qué es y de dónde sale) en el mismo
  commit que el código que la usa — nunca después.
- Ver [[stack]] y [[architecture]] para cómo esto se conecta con la
  decisión de empaquetado de Capacitor.
