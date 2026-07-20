/** Escala secuencial de 5 pasos sobre los tokens chart-1..5 (bajo→excelente,
 * ver decisions/design-system.md). Compartida entre Calendario y Memento
 * Mori para que ambas pantallas coloreen igual un mismo score. */
export const HEATMAP_LEGEND = [
  { threshold: 25, label: "Bajo", token: "var(--chart-1)" },
  { threshold: 50, label: "Medio", token: "var(--chart-2)" },
  { threshold: 70, label: "Bueno", token: "var(--chart-3)" },
  { threshold: 90, label: "Muy bueno", token: "var(--chart-4)" },
  { threshold: 101, label: "Excelente", token: "var(--chart-5)" },
] as const;

/** score: 0-100, o null si el día/semana no tiene datos (sin hábitos
 * activos ese día — distinto de 0%, ver domain/user-daily-stat.md). */
export function scoreToColor(score: number | null): string {
  if (score === null) return "var(--track)";
  const step = HEATMAP_LEGEND.find((s) => score < s.threshold) ?? HEATMAP_LEGEND[HEATMAP_LEGEND.length - 1];
  return step.token;
}

export function statToScore(dueCount: number, completedCount: number): number | null {
  if (dueCount === 0) return null;
  return Math.round((completedCount / dueCount) * 100);
}
