/** Utilidades de fecha para la pantalla Memento Mori. Todo se maneja en
 * UTC "de calendario" (sin componente de hora) para que agrupar por
 * semana/año no dependa de la zona horaria del navegador — las fechas que
 * manda el backend (`YYYY-MM-DD`) ya representan el día de calendario en
 * la zona horaria del usuario, no hace falta volver a convertir. */

export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Fecha de calendario "de hoy" según el reloj local del navegador,
 * como string `YYYY-MM-DD`. Aproximación cliente-side razonable — el
 * backend recalcula "hoy" real por usuario/timezone en cada endpoint. */
export function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Semana ISO-8601 (lunes a domingo, semana 1 = la que contiene el primer
 * jueves del año). Devuelve el año ISO (que puede diferir del año de
 * calendario en los bordes de diciembre/enero) y el número de semana. */
export function getISOWeek(date: Date): { isoYear: number; isoWeek: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // lunes=0 ... domingo=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // jueves de esta semana

  const isoYear = d.getUTCFullYear();
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4DayNum = (jan4.getUTCDay() + 6) % 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4DayNum);

  const isoWeek = Math.round((d.getTime() - week1Monday.getTime()) / (7 * 24 * 3600 * 1000)) + 1;
  return { isoYear, isoWeek };
}
