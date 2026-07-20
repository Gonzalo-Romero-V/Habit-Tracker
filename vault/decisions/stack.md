---
status: draft
type: decision
layer: H3
created: 2026-07-17
---

# Stack — Habit Tracker

## Stack elegido

- Backend: Laravel 12 + PostgreSQL 17 + Sanctum (API tokens, no cookies SPA).
- Frontend web: Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui
  (ver [[design-system]] para tokens, tema claro/oscuro y responsive).
- Frontend mobile: el **mismo codebase** Next.js, empaquetado con Capacitor
  (iOS/Android) — un solo código de UI, dos shells de distribución.
- Recurrencia de hábitos — dos motores, sin mezclar (ver [[habit]]):
  - Modo `fixed`: librería `rlanvin/php-rrule` (RFC5545) en el backend
    para expandir `recurrence_rule` (FREQ/INTERVAL/BYDAY) en fechas
    concretas de ocurrencia. Pinneada — no hay ambigüedad de cuál usar.
  - Modo `quota`: **sin librería** — es aritmética de ventana de fechas
    (contar `HabitLog` `completed` dentro de la semana ISO del timezone
    del usuario contra `quota_target`), no necesita RRULE ni ninguna
    dependencia externa.
- Autenticación con Google ("Continuar con Google"): flujo de **ID token**,
  no OAuth2 redirect (Socialite) — encaja con la arquitectura API+SPA
  desacoplada ya elegida (mismo principio que Sanctum Bearer, sin sesión
  de servidor). Un único endpoint backend (`/api/v1/auth/google`) sirve a
  ambos clientes:
  - Web: Google Identity Services (`https://accounts.google.com/gsi/client`),
    client-side, entrega un ID token firmado.
  - Mobile (Capacitor, cuando se empaquete): plugin
    `@codetrix-studio/capacitor-google-auth` — entrega el mismo tipo de ID
    token vía Google Sign-In nativo, se postea al mismo endpoint. Elegido
    ahora (aunque no se implemente todavía) para no revisitar esta
    decisión de arquitectura cuando llegue el empaquetado mobile.
  - Backend: `google/apiclient` (paquete oficial de Google) verifica la
    firma/audiencia/expiración del ID token (`Google\Client::verifyIdToken()`)
    — sin necesitar client secret, solo el Client ID.
  - **Identidad vs. autorización — por qué este flujo y no el clásico**:
    GIS (ID token) es un flujo de **identidad** — prueba quién es el
    usuario (email/nombre/foto), nada más; no le da al backend acceso
    para llamar otras APIs de Google (Calendar, Drive, Gmail...). El
    flujo OAuth2 clásico (`redirect_uri` + client secret, ej. Socialite)
    es de **autorización** — el usuario concede acceso explícito a un
    servicio de Google concreto vía `scope`, y ahí sí Google entrega
    `access_token`/`refresh_token` para llamar esa API. Para lo que
    Habit Tracker necesita hoy (solo saber quién es el usuario) GIS es
    el estándar actual recomendado por Google (reemplazó a la librería
    vieja `gapi.auth2`) — el flujo clásico sería sobre-ingeniería sin
    necesidad real. **Si en el futuro hace falta acceso a una API de
    Google** (ej. sincronizar con Google Calendar), no se reemplaza este
    flujo: se **agrega** una autorización incremental separada
    (`google.accounts.oauth2.initCodeClient`, misma librería GIS) pedida
    recién cuando el usuario activa esa función puntual (ej. "Conectar mi
    Google Calendar" en configuración) — reutiliza el mismo
    `google/apiclient` y el mismo Client ID del backend, sin tocar el
    login existente. Precedente de por qué el usuario preguntó esto: en
    proyectos anteriores con este mismo perfil de usuario se usó el
    flujo clásico (redirect + secret), lo cual explica por qué el
    restrictor de "Test users" de Google Cloud Console (Publishing
    status = Testing) sí bloqueaba ahí — con GIS, Google no aplica esa
    restricción con el mismo rigor para scopes no sensibles
    (`openid email profile`), verificado en la práctica: 3 cuentas de
    Google distintas, ninguna en la lista de test users salvo la
    primera, lograron loguearse igual.
  - **Bug real encontrado y corregido al implementar**: en Windows, PHP
    no trae configurado un CA bundle por default
    (`curl.cainfo`/`openssl.cafile` vacíos en `php.ini`) — `verifyIdToken()`
    fallaba con `cURL error 60: SSL certificate ... unable to get local
    issuer certificate` al pedir las claves públicas de Google. Se
    resolvió descargando `cacert.pem` (el bundle estándar de curl.se) y
    apuntando `curl.cainfo`/`openssl.cafile` a él en el `php.ini` de la
    máquina — es una configuración de entorno local, no algo que viva en
    el repo. Si esto se repite en otra máquina Windows, es la primera
    sospecha.
- Notificaciones push — **stub mientras no haya credenciales de Firebase**
  (ver [[reminder]] y [[device-token]]): interfaz `PushSender` con un
  único método `send(DeviceToken $token, string $title, string $body)`;
  la implementación real (`FcmPushSender`) todavía no existe, se usa
  `LogPushSender` (solo loguea, no llama a ningún servicio externo) hasta
  tener el proyecto de Firebase. El resto del sistema (qué recordatorio
  está vencido, a qué dispositivos despachar) es lógica real desde ya —
  solo el transporte final está stubeado, para no bloquear el resto del
  incremento por una credencial externa pendiente.
- Notificaciones push: Firebase Cloud Messaging (FCM) como transporte único
  — para Android directo, para iOS vía el relay de FCM a APNs. Cliente:
  plugin `@capacitor-firebase/messaging` (precedente probado en financehub
  con el mismo stack, preferido sobre `@capacitor/push-notifications` +
  SDK de Firebase por separado).
- Colas/scheduler: Laravel Queue + Scheduler (`schedule:work` / cron) para
  evaluar recordatorios pendientes por timezone de usuario y despachar los
  Jobs de envío de push.

## Motivación

La API va desacoplada del frontend porque hay dos consumidores desde el día
uno (web y mobile) que no deben duplicar lógica de negocio (cálculo de
streaks, evaluación de metas, expansión de recurrencia). Next.js se reutiliza
para ambos targets — un solo código de UI en vez de mantener dos frontends
(ej. Next.js + Flutter) — priorizando velocidad de desarrollo sobre un
"look" 100% nativo. Sanctum con tokens Bearer (no cookies de sesión SPA)
porque Capacitor corre como app nativa empaquetada: el contexto no es un
browser same-site, así que cookies complican CORS/CSRF sin aportar nada que
un token Bearer no resuelva más simple.

## Alternativas descartadas

- **Laravel Passport** (OAuth2 completo): descartado — es infraestructura
  pensada para que terceros consuman tu API; acá el único consumidor es
  nuestro propio frontend (web + mobile), Sanctum alcanza.
- **Sanctum SPA (cookies same-site)**: descartado porque Capacitor no es un
  contexto "browser same-site"; forzar cookies ahí genera fricción de CORS
  sin beneficio real sobre un token Bearer.
- **Frontend mobile nativo separado** (React Native / Flutter): descartado
  por el costo de mantener 2 UIs en paralelo; Capacitor permite reusar el
  Next.js existente y reduce superficie de mantenimiento.
- **MySQL**: descartado a favor de PostgreSQL por mejor soporte de tipos
  ricos (enums nativos, jsonb) que simplifican el modelado de
  `metric_type` y la regla de recurrencia.

## Restricciones derivadas

- Toda la lógica de negocio (streaks, evaluación de metas, expansión de
  recurrencia) vive en servicios del backend Laravel — el frontend nunca
  calcula reglas de negocio, solo las consume vía API (ver
  [[architecture]] → Separación de responsabilidades).
- Los valores monetarios y de duración nunca se serializan como floats en la
  API: `duration` en segundos (entero), `currency` en unidades mínimas
  (centavos, entero) + código ISO 4217 (ver [[habit-metric]]).
- El frontend Next.js se compila en dos modos según `BUILD_TARGET` (web
  con rewrites server-side vs. mobile con export estático) — mecanismo
  completo en [[environments]].
- Los endpoints viven exclusivamente bajo `/api/v1/*` (ver
  [[api-contracts]]) — nunca rutas `web.php` para datos de la aplicación.

## Herramientas de desarrollo

- Backend: PHPUnit, Pint, migraciones Laravel, `php artisan schedule:work`
  en desarrollo local.
- Frontend: linter ESLint flat config; framework de testing sin definir aún
  (ver [[architecture]] → Decisiones pendientes).
- Push: proyecto Firebase compartido entre ambas apps (Android/iOS),
  credenciales fuera del repo vía `.env` / `google-services.json` (nunca
  commiteados).
