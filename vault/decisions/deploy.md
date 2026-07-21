---
status: draft
type: decision
layer: H3
created: 2026-07-21
code_path: DEPLOY.md
---

# Deploy — Habit Tracker

## Qué

Resuelve el pendiente "dónde se despliega" abierto en [[architecture]]:
el backend (Laravel) y PostgreSQL corren en la misma máquina, bindeados a
`127.0.0.1` (nunca `0.0.0.0`) — no se exponen a Internet bajo ninguna
circunstancia. Solo el frontend (Next.js, build web) se expone al público,
vía un túnel nombrado de Cloudflare (`cloudflared`) con hostname fijo.

## Por qué

El frontend web ya proxea `/api/*` server-side hacia `BACKEND_URL` (ver
[[environments]]) — el browser del usuario final nunca conoce la URL del
backend. Tunelear solo el frontend aprovecha ese mecanismo existente en vez
de agregar uno nuevo: un solo punto de entrada público, superficie de
ataque mínima, cero configuración de red adicional para backend/DB.

## Mecanismo

- Cloudflare Tunnel con hostname fijo (no túnel rápido/`trycloudflare.com`
  — Google Identity Services exige un origen estable para el login con
  Google, y una URL aleatoria por corrida lo rompe).
- CORS del backend restringido vía `CORS_ALLOWED_ORIGINS`
  (`app/backend/config/cors.php`, publicado explícitamente — el skeleton
  de Laravel no lo trae y cae en `allowed_origins: ['*']`). Defensa en
  profundidad: el aislamiento real es de red, no de CORS, porque la API se
  autentica con Bearer token (Sanctum), nunca con cookies.
- Los 4 procesos de producción (`serve`, `queue:work`, `schedule:work`,
  `next start`) corren en la misma máquina — procedimiento operativo
  completo (variables por app, secretos fuera de git, gotcha de CA bundle
  en Windows) en `DEPLOY.md`, no duplicado acá.

## Restricciones derivadas

- El backend nunca acepta `--host=0.0.0.0`.
- Ninguna regla de `ingress` del túnel apunta al puerto del backend o de
  PostgreSQL — solo al puerto del frontend.
- Cambiar de máquina es solo variables de `.env` + copiar los secretos
  fuera de git (ver checklist en `DEPLOY.md`) — nunca tocar código.
