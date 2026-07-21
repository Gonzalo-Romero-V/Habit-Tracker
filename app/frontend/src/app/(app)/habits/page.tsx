"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { listHabits, type Habit } from "@/hooks/useHabits";
import { useHabitForm } from "@/components/custom/HabitFormProvider";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RECURRENCE_LABEL: Record<Habit["recurrence_type"], string> = {
  fixed: "Días fijos",
  quota: "Cuota semanal",
};

type StatusFilter = "active" | "archived";

export default function HabitsPage() {
  const [filter, setFilter] = useState<StatusFilter>("active");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openEdit, version } = useHabitForm();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    listHabits(filter)
      .then(setHabits)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudieron cargar los hábitos."))
      .finally(() => setIsLoading(false));
  }, [filter, version]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-lg font-semibold">Todos los hábitos</h1>

      <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
        {(["active", "archived"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-semibold",
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
            onClick={() => setFilter(f)}
          >
            {f === "active" ? "Activos" : "Archivados"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : habits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {filter === "active" ? "Todavía no creaste ningún hábito." : "No tienes hábitos archivados."}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <button type="button" onClick={() => openEdit(habit)} className="flex flex-1 items-center gap-3 text-left">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{habit.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {RECURRENCE_LABEL[habit.recurrence_type]} · Racha: {habit.current_streak} · Mejor: {habit.best_streak}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/habits/${habit.id}`} aria-label="Ver historial">
                  <History className="size-4" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
