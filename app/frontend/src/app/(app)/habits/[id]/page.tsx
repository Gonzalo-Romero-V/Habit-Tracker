import { HabitDetailClient } from "./HabitDetailClient";

/** Un solo param placeholder — Next exige al menos uno para "output:
 * export" (array vacío no alcanza, tira build error), pero nunca se
 * navega de verdad a esa ruta exacta: en la app empaquetada (Capacitor)
 * toda navegación hacia acá es client-side (Link/router de Next), nunca
 * una carga de página fresca contra el servidor estático por id — el
 * `id` real se lee de la URL vía useParams() dentro de HabitDetailClient
 * en tiempo de ejecución. En el build web (con servidor) esto no cambia
 * nada del comportamiento normal. Ver decisions/environments.md. */
export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function HabitDetailPage() {
  return <HabitDetailClient />;
}
