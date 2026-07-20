"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getHabit, type Habit } from "@/hooks/useHabits";
import {
  listHabitLogs,
  updateHabitLog,
  createHabitLog,
  deleteHabitLog,
  type HabitLogEntry,
} from "@/hooks/useHabitLogs";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Fecha local del navegador — coincide con el timezone que apiFetch ya
 * manda en X-Client-Timezone (ver lib/api.ts), así "hoy" siempre calza
 * con el día que el backend usó para evaluar el header. */
function todayLocalDateString(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function HabitDetailPage() {
  const params = useParams<{ id: string }>();
  const habitId = Number(params.id);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [metricValues, setMetricValues] = useState<Record<number, number>>({});

  function reload() {
    setIsLoading(true);
    Promise.all([getHabit(habitId), listHabitLogs(habitId)])
      .then(([h, l]) => {
        setHabit(h);
        setLogs(l);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el hábito."))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, [habitId]);

  const today = todayLocalDateString();
  const todayLog = logs.find((l) => l.occurrence_date === today) ?? null;

  async function handleBinaryCheckOff() {
    setError(null);
    setIsSaving(true);
    try {
      if (todayLog) {
        await updateHabitLog(habitId, todayLog.id);
      } else {
        await createHabitLog(habitId, { occurrence_date: today });
      }
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUndo() {
    if (!todayLog) return;
    setError(null);
    setIsSaving(true);
    try {
      await deleteHabitLog(habitId, todayLog.id);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo deshacer.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMetricsSubmit() {
    if (!habit) return;
    setError(null);
    setIsSaving(true);
    const metrics = habit.metrics.map((m) => ({
      habit_metric_id: m.id,
      value:
        metricValues[m.id] ??
        Number(todayLog?.metrics.find((tm) => tm.habit_metric_id === m.id)?.value ?? 0),
    }));
    try {
      if (todayLog) {
        await updateHabitLog(habitId, todayLog.id, metrics);
      } else {
        await createHabitLog(habitId, { occurrence_date: today, metrics });
      }
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !habit) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{habit.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Racha actual: {habit.current_streak} · Mejor racha: {habit.best_streak}
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="rounded-md border border-border p-4">
            <p className="mb-3 text-sm font-medium">Hoy ({today})</p>

            {habit.tracking_type === "binary" ? (
              todayLog?.status === "completed" ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">✓ Completado</span>
                  <Button variant="outline" size="sm" onClick={handleUndo} disabled={isSaving}>
                    Deshacer
                  </Button>
                </div>
              ) : (
                <Button onClick={handleBinaryCheckOff} disabled={isSaving}>
                  Marcar como hecho
                </Button>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {habit.metrics.map((metric) => (
                  <div key={metric.id} className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">
                      {metric.name} (meta: {metric.target_value}
                      {metric.unit ? ` ${metric.unit}` : ""})
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={
                        metricValues[metric.id] ??
                        Number(todayLog?.metrics.find((m) => m.habit_metric_id === metric.id)?.value ?? 0)
                      }
                      onChange={(e) =>
                        setMetricValues((prev) => ({ ...prev, [metric.id]: Number(e.target.value) }))
                      }
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Button onClick={handleMetricsSubmit} disabled={isSaving}>
                    Guardar
                  </Button>
                  {todayLog?.status === "completed" && <span className="text-sm text-primary">✓ Completado</span>}
                  {todayLog && (
                    <Button variant="outline" size="sm" onClick={handleUndo} disabled={isSaving}>
                      Deshacer
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin registros todavía.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between text-sm">
                  <span>{log.occurrence_date}</span>
                  <span
                    className={
                      log.status === "completed"
                        ? "text-primary"
                        : log.status === "missed"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }
                  >
                    {log.status === "completed" ? "Completado" : log.status === "missed" ? "Fallado" : "Pendiente"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
