---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: ""
---

# DeviceToken

## Definición

El token de push notification (Firebase Cloud Messaging) de un dispositivo
concreto donde un [[user]] tiene la app instalada o la web abierta con
permiso de notificaciones. Es el destino al que el scheduler de
[[reminder]] despacha los pushes.

## Estados

Sin ciclo de vida propio — existe mientras el dispositivo tenga la
notificación registrada; se elimina si el token se invalida (respuesta de
error de FCM) o el usuario cierra sesión en ese dispositivo.

## Atributos clave

- `platform` ∈ `{ios, android, web}`.
- `push_token` — el token FCM del dispositivo. Único por dispositivo.
- `last_seen_at` — última vez que el cliente confirmó el token como
  válido (refresco periódico).

## Relaciones

- N:1 con [[user]] — un usuario puede tener varios `DeviceToken`
  simultáneos (multi-dispositivo: web + mobile, o varios móviles).

## Reglas de negocio

- Un `push_token` inválido (FCM responde error de "no registrado") se
  elimina del sistema — no se reintenta indefinidamente.
- El scheduler despacha a **todos** los `DeviceToken` activos del usuario
  dueño del [[habit]] con [[reminder]] debido, no solo al último usado.

## Notas de implementación
