"use client";

import { useEffect, useState } from "react";
import { listHabitMonthlyStats, type Habit, type HabitMonthlyStatEntry } from "@/hooks/useHabits";
import type { HabitLogEntry } from "@/hooks/useHabitLogs";
import { ApiError } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTH_ABBR = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

type ViewMode = "mensual" | "anual";

type HabitEvolutionChartProps = {
  habits: Habit[];
  /** Logs (hasta 30, más recientes) por hábito, ya cargados por la página
   * padre para la sección "Consistencia por hábito" — se reutilizan acá
   * para la vista Mensual en vez de volver a pedirlos. */
  logsByHabit: Record<number, HabitLogEntry[]>;
};

/** Selector de hábito + toggle Mensual/Anual + gráfica de evolución.
 *
 * Mensual: un punto por log (hasta los últimos 30), valor 100 si
 * `completed`, 0 si `missed` o `pending` — mapeo documentado acá porque el
 * enunciado deja el mapeo exacto a criterio. Para que "missed" y "pending"
 * (ambos valor 0) sigan siendo distinguibles visualmente, se dibuja una
 * barra completa (color primario) para `completed` y una barra baja
 * coloreada por estado (rojo/gris) para el resto, en vez de una barra de
 * altura 0 indistinguible del vacío.
 *
 * Anual: un punto por mes cerrado (`listHabitMonthlyStats`), valor =
 * completed/(completed+missed) * 100, saltando meses sin datos. */
export function HabitEvolutionChart({ habits, logsByHabit }: HabitEvolutionChartProps) {
  const [selectedId, setSelectedId] = useState<number | null>(habits[0]?.id ?? null);
  const [view, setView] = useState<ViewMode>("mensual");
  const [monthlyStatsCache, setMonthlyStatsCache] = useState<Record<number, HabitMonthlyStatEntry[]>>({});
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === null && habits.length > 0) {
      setSelectedId(habits[0].id);
    }
  }, [habits, selectedId]);

  useEffect(() => {
    if (view !== "anual" || selectedId === null || monthlyStatsCache[selectedId]) return;

    let cancelled = false;
    setIsLoadingMonthly(true);
    setError(null);

    listHabitMonthlyStats(selectedId)
      .then((entries) => {
        if (cancelled) return;
        setMonthlyStatsCache((prev) => ({ ...prev, [selectedId]: entries }));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "No se pudo cargar la evolución anual.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMonthly(false);
      });

    return () => {
      cancelled = true;
    };
  }, [view, selectedId, monthlyStatsCache]);

  if (habits.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay hábitos activos para mostrar.</p>;
  }

  const selectedHabit = habits.find((h) => h.id === selectedId) ?? habits[0];

  const monthlyLogs = [...(logsByHabit[selectedHabit.id] ?? [])].sort((a, b) =>
    a.occurrence_date.localeCompare(b.occurrence_date),
  );

  const yearlyPoints = (monthlyStatsCache[selectedHabit.id] ?? [])
    .filter((e) => e.completed_count + e.missed_count > 0)
    .slice()
    .sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month))
    .map((e) => ({
      ...e,
      pct: (e.completed_count / (e.completed_count + e.missed_count)) * 100,
    }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(selectedHabit.id)} onValueChange={(v) => setSelectedId(Number(v))}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {habits.map((h) => (
              <SelectItem key={h.id} value={String(h.id)}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
          {(["mensual", "anual"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
              onClick={() => setView(v)}
            >
              {v === "mensual" ? "Mensual" : "Anual"}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {view === "mensual" ? (
        monthlyLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin registros todavía para este hábito.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex h-28 items-end gap-[3px] overflow-x-auto">
              {monthlyLogs.map((log) => (
                <div
                  key={log.id}
                  title={`${log.occurrence_date}: ${
                    log.status === "completed" ? "Completado" : log.status === "missed" ? "Fallado" : "Pendiente"
                  }`}
                  className={cn(
                    "w-2 min-w-[6px] flex-1 rounded-t-sm",
                    log.status === "completed"
                      ? "h-full bg-primary"
                      : log.status === "missed"
                        ? "h-2 bg-destructive/60"
                        : "h-2 bg-muted-foreground/40",
                  )}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" /> Completado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-destructive/60" /> Fallado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground/40" /> Pendiente
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos {monthlyLogs.length} registros del hábito (no es una ventana calendario estricta de 30 días).
            </p>
          </div>
        )
      ) : isLoadingMonthly ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : yearlyPoints.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay meses cerrados con datos para este hábito.</p>
      ) : (
        <div className="flex h-28 items-end gap-2">
          {yearlyPoints.map((p) => (
            <div key={`${p.year}-${p.month}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-sm bg-primary"
                  style={{ height: `${p.pct}%` }}
                  title={`${MONTH_ABBR[p.month - 1]} ${p.year}: ${Math.round(p.pct)}%`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {MONTH_ABBR[p.month - 1]} {String(p.year).slice(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
