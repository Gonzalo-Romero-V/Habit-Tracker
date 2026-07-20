"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { archiveHabit, deleteHabit, listHabits, type Habit } from "@/hooks/useHabits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";

const RECURRENCE_LABEL: Record<Habit["recurrence_type"], string> = {
  fixed: "Días fijos",
  quota: "Cuota semanal",
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    listHabits()
      .then(setHabits)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudieron cargar los hábitos."))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleArchive(id: number) {
    try {
      await archiveHabit(id);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo archivar el hábito.");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("¿Eliminar este hábito de forma permanente? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await deleteHabit(id);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el hábito.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Mis hábitos</h1>
        <Button asChild>
          <Link href="/habits/new">Nuevo hábito</Link>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : habits.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no creaste ningún hábito.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <Card key={habit.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <Link href={`/habits/${habit.id}`} className="hover:underline">
                    {habit.name}
                  </Link>
                  <span className="text-xs font-normal text-muted-foreground">
                    {RECURRENCE_LABEL[habit.recurrence_type]}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Racha actual: {habit.current_streak} · Mejor racha: {habit.best_streak}
                </p>
                <div className="flex gap-2">
                  {habit.status === "active" && (
                    <Button variant="outline" size="sm" onClick={() => handleArchive(habit.id)}>
                      Archivar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(habit.id)}>
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
