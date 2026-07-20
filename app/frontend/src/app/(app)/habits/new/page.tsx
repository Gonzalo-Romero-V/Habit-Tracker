"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createHabit, type NewMetricInput } from "@/hooks/useHabits";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS: { value: string; label: string }[] = [
  { value: "MO", label: "Lun" },
  { value: "TU", label: "Mar" },
  { value: "WE", label: "Mié" },
  { value: "TH", label: "Jue" },
  { value: "FR", label: "Vie" },
  { value: "SA", label: "Sáb" },
  { value: "SU", label: "Dom" },
];

function buildRecurrenceRule(selectedDays: string[]): string {
  if (selectedDays.length === 7) return "FREQ=DAILY";

  const ordered = DAYS.filter((d) => selectedDays.includes(d.value)).map((d) => d.value);

  return `FREQ=WEEKLY;BYDAY=${ordered.join(",")}`;
}

const METRIC_TYPE_INFO: Record<
  NewMetricInput["metric_type"],
  { label: string; help: string; targetLabel: string; targetPlaceholder: string }
> = {
  count: {
    label: "Cantidad",
    help: "Un número simple con una unidad libre (páginas, vasos, km, repeticiones...).",
    targetLabel: "Meta (cantidad)",
    targetPlaceholder: "20",
  },
  duration: {
    label: "Duración",
    help: "Tiempo. Ingresá la meta en minutos — se guarda internamente en segundos.",
    targetLabel: "Meta (minutos)",
    targetPlaceholder: "30",
  },
  currency: {
    label: "Monto",
    help: "Dinero. Ingresá la meta en la unidad de tu moneda (ej. dólares) — se guarda en centavos.",
    targetLabel: "Meta (monto)",
    targetPlaceholder: "20.00",
  },
};

/** Convierte el valor ingresado por el usuario (unidad natural) a lo que
 * espera el backend: duration en segundos, currency en centavos (ver
 * domain/habit-metric.md — nunca floats ambiguos). */
function toStoredTargetValue(metric: NewMetricInput): number {
  if (metric.metric_type === "duration") return Math.round(metric.target_value * 60);
  if (metric.metric_type === "currency") return Math.round(metric.target_value * 100);
  return metric.target_value;
}

export default function NewHabitPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [trackingType, setTrackingType] = useState<"binary" | "quantifiable">("binary");
  const [recurrenceType, setRecurrenceType] = useState<"fixed" | "quota">("fixed");
  const [selectedDays, setSelectedDays] = useState<string[]>(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]);
  const [quotaTarget, setQuotaTarget] = useState(3);
  const [metrics, setMetrics] = useState<NewMetricInput[]>([
    { name: "", metric_type: "count", target_value: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function updateMetric(index: number, patch: Partial<NewMetricInput>) {
    setMetrics((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function addMetric() {
    setMetrics((prev) => [...prev, { name: "", metric_type: "count", target_value: 0 }]);
  }

  function removeMetric(index: number) {
    setMetrics((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createHabit({
        name,
        tracking_type: trackingType,
        recurrence_type: recurrenceType,
        recurrence_rule: recurrenceType === "fixed" ? buildRecurrenceRule(selectedDays) : undefined,
        quota_target: recurrenceType === "quota" ? quotaTarget : undefined,
        quota_period: recurrenceType === "quota" ? "week" : undefined,
        metrics:
          trackingType === "quantifiable"
            ? metrics.map((m) => ({ ...m, target_value: toStoredTargetValue(m) }))
            : undefined,
      });
      router.push("/habits");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el hábito.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Nuevo hábito</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={trackingType} onValueChange={(v) => setTrackingType(v as typeof trackingType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary">Binario (se hace o no se hace)</SelectItem>
                <SelectItem value="quantifiable">Cuantificable (con métricas)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Recurrencia</Label>
            <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as typeof recurrenceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Días fijos</SelectItem>
                <SelectItem value="quota">Cuota semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrenceType === "fixed" ? (
            <div className="flex flex-col gap-2">
              <Label>Días programados</Label>
              <div className="flex flex-wrap gap-3">
                {DAYS.map((day) => (
                  <label key={day.value} className="flex items-center gap-1.5 text-sm">
                    <Checkbox
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="quota_target">Veces por semana</Label>
              <Input
                id="quota_target"
                type="number"
                min={1}
                required
                value={quotaTarget}
                onChange={(e) => setQuotaTarget(Number(e.target.value))}
              />
            </div>
          )}

          {trackingType === "quantifiable" && (
            <div className="flex flex-col gap-3">
              <Label>Métricas</Label>
              {metrics.map((metric, index) => {
                const info = METRIC_TYPE_INFO[metric.metric_type];

                return (
                  <div key={index} className="flex flex-col gap-2 rounded-md border border-border p-3">
                    <Input
                      placeholder="Nombre (ej. Páginas leídas)"
                      required
                      value={metric.name}
                      onChange={(e) => updateMetric(index, { name: e.target.value })}
                    />

                    <Select
                      value={metric.metric_type}
                      onValueChange={(v) =>
                        updateMetric(index, {
                          metric_type: v as NewMetricInput["metric_type"],
                          unit: undefined,
                          currency_code: undefined,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Cantidad (conteo)</SelectItem>
                        <SelectItem value="duration">Duración (tiempo)</SelectItem>
                        <SelectItem value="currency">Monto (dinero)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{info.help}</p>

                    <div className="flex gap-2">
                      {metric.metric_type === "count" && (
                        <Input
                          placeholder="Unidad (ej. páginas, vasos, km)"
                          className="flex-1"
                          value={metric.unit ?? ""}
                          onChange={(e) => updateMetric(index, { unit: e.target.value })}
                        />
                      )}
                      {metric.metric_type === "currency" && (
                        <Input
                          placeholder="Moneda (ISO, ej. USD)"
                          maxLength={3}
                          required
                          className="w-28 uppercase"
                          value={metric.currency_code ?? ""}
                          onChange={(e) => updateMetric(index, { currency_code: e.target.value.toUpperCase() })}
                        />
                      )}
                      <div className="flex flex-1 flex-col gap-1">
                        <Label className="text-xs font-normal text-muted-foreground">
                          {info.targetLabel}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step={metric.metric_type === "currency" ? "0.01" : "1"}
                          placeholder={info.targetPlaceholder}
                          required
                          value={metric.target_value}
                          onChange={(e) => updateMetric(index, { target_value: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {metrics.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeMetric(index)}>
                        Quitar métrica
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                Agregar métrica
              </Button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear hábito"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
