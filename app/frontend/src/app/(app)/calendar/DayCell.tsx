"use client";

import { scoreToColor } from "@/lib/heatmap";
import { cn } from "@/lib/utils";

type DayCellProps = {
  day: number;
  /** Fecha estrictamente posterior a hoy — todavía no hay (ni habrá) datos. */
  isFuture: boolean;
  isToday: boolean;
  isSelected: boolean;
  /** null = sin datos (ningún hábito activo ese día). Ignorado si isFuture. */
  score: number | null;
  onClick: () => void;
};

/** Una celda del grid mensual: día pasado/hoy se pinta según su score
 * (mismos helpers que Memento Mori, ver lib/heatmap.ts); día futuro se
 * muestra como placeholder punteado, distinto de "sin datos" real. */
export function DayCell({ day, isFuture, isToday, isSelected, score, onClick }: DayCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isToday ? "date" : undefined}
      aria-pressed={isSelected}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-lg text-xs font-semibold text-foreground transition-transform active:scale-95",
        isFuture
          ? "border border-dashed border-border bg-transparent text-muted-foreground/60"
          : "border border-transparent",
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        isToday && !isSelected && "ring-1 ring-foreground/40",
      )}
      style={isFuture ? undefined : { backgroundColor: scoreToColor(score) }}
    >
      {day}
    </button>
  );
}
