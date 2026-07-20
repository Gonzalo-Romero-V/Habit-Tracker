---
status: draft
type: domain
layer: H2
created: 2026-07-17
code_path: app/backend/app/Models/User.php
---

# User

## Definición

La persona dueña de una cuenta. Todo dato del sistema ([[habit]],
[[category]], [[habit-log]], [[device-token]], [[reminder]]) pertenece a
exactamente un `User` y nunca es visible para otro.

## Estados

No tiene ciclo de vida propio en el MVP (no hay verificación de email,
suspensión de cuenta, ni soft-delete documentado). Una cuenta existe desde
el registro hasta que se borra.

## Atributos clave

- `name` — nombre para mostrar en la UI (saludo, iniciales de avatar). Sin
  regla de negocio asociada más allá de ser obligatorio al registrarse.
- `email` — único, usado para login.
- `password` — hasheado, nunca expuesto en respuestas de la API.
- `timezone` — string IANA (ej. `America/Guayaquil`). **Obligatorio.**
  Es el que determina el corte de "día" para todos los hábitos del usuario
  (ver invariante en [[vision]]). Se captura en el registro (auto-detectado
  del cliente) y es editable después. Diseño híbrido (precedente
  financehub): además del valor almacenado, cada request autenticado
  puede mandar el header `X-Client-Timezone` (ver [[api-contracts]]); si
  llega y difiere del valor guardado, el backend lo actualiza
  oportunistamente. Esto mantiene el campo fresco automáticamente si el
  usuario viaja, **sin** que el usuario tenga que editar su perfil a mano.
  El valor almacenado sigue siendo necesario porque los Jobs asíncronos
  (scheduler de [[reminder]], cálculo de streak en background) no tienen
  un request del cliente del cual leer el header.

## Relaciones

- 1:N con [[habit]] — un usuario tiene muchos hábitos.
- 1:N con [[category]] — un usuario define sus propias categorías.
- 1:N con [[device-token]] — un usuario puede tener varios dispositivos
  registrados (web + mobile, o varios móviles).
- 1:N con tokens Sanctum (uno por dispositivo/sesión activa) — no es una
  entidad de dominio, es infraestructura de auth (ver [[architecture]]).

## Reglas de negocio

- Todo query de [[habit]], [[category]], [[habit-log]], [[device-token]] o
  [[reminder]] se filtra server-side por el `user_id` del token
  autenticado — nunca por un valor recibido del cliente.
- Cambiar `timezone` no reescribe `occurrence_date` de [[habit-log]] ya
  generados; solo afecta el cálculo de "hoy" hacia adelante.

## Notas de implementación

`User.php` (`app/backend/app/Models/User.php`) extiende `Authenticatable`
con `fillable: name, email, password`, y usa `HasApiTokens` (Sanctum)
además de `HasFactory`/`Notifiable` — habilita la emisión de tokens
Bearer para la API (ver [[architecture]] → Gestión de autenticación).
`timezone` (atributo obligatorio según este dominio) todavía **no** está
en la migración de `users` — es el skeleton default de Laravel; se agrega
cuando se implemente el registro/perfil real.

Actualización: `timezone` ya está en la migración de `users`
(columna `string`, obligatoria) y en `User::$fillable` — la nota anterior
de este archivo que decía que faltaba quedó resuelta en el commit
`feat(backend): add timezone column to users table`.
