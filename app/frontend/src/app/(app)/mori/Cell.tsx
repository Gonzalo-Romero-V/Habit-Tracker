import { scoreToColor } from "@/lib/heatmap";
import { cn } from "@/lib/utils";

type CellProps = {
  title: string;
  /** null junto con isFuture=false = "sin registro" real (antes del primer
   * HabitLog, o un día pasado sin ningún hábito activo). Ignorado si
   * isFuture=true. */
  score: number | null;
  /** Fecha estrictamente posterior a hoy — todavía no puede tener datos,
   * se distingue visualmente de "sin registro" (ver Calendario, mismo
   * tratamiento). */
  isFuture?: boolean;
};

/** Celda cuadrada mínima del heatmap (una semana o un día). */
export function Cell({ score, title, isFuture = false }: CellProps) {
  return (
    <span
      title={title}
      className={cn(
        "size-2.5 shrink-0 rounded-[2px]",
        isFuture && "border border-dashed border-border bg-transparent",
      )}
      style={isFuture ? undefined : { backgroundColor: scoreToColor(score) }}
    />
  );
}
