import { scoreToColor } from "@/lib/heatmap";

/** Celda cuadrada mínima del heatmap (una semana o un día). Sin datos
 * (`score === null`) se pinta con el color "sin registro" de scoreToColor. */
export function Cell({ score, title }: { score: number | null; title: string }) {
  return (
    <span
      title={title}
      className="size-2.5 shrink-0 rounded-[2px]"
      style={{ backgroundColor: scoreToColor(score) }}
    />
  );
}
