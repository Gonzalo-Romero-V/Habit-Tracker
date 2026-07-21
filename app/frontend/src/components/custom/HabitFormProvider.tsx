"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  unarchiveHabit,
  updateHabitMetric,
  type Habit,
  type NewMetricInput,
} from "@/hooks/useHabits";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryForm } from "@/components/custom/CategoryFormProvider";
import { listReminders, createReminder, updateReminder, deleteReminder } from "@/hooks/useReminders";
import { ApiError } from "@/lib/api";
import {
  DAYS,
  buildRecurrenceRule,
  parseRecurrenceRule,
  METRIC_TYPE_INFO,
  toStoredTargetValue,
  fromStoredTargetValue,
} from "@/lib/habit-form-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type TrackingType = "binary" | "quantifiable";
type RecurrenceType = "fixed" | "quota";

type FormState = {
  name: string;
  categoryId: string;
  trackingType: TrackingType;
  metricType: NewMetricInput["metric_type"];
  metricName: string;
  metricUnit: string;
  metricGoal: number;
  recurrenceType: RecurrenceType;
  days: string[];
  timesPerWeek: number;
  reminderOn: boolean;
  reminderTime: string;
};

const emptyForm: FormState = {
  name: "",
  categoryId: "",
  trackingType: "binary",
  metricType: "count",
  metricName: "",
  metricUnit: "",
  metricGoal: 1,
  recurrenceType: "fixed",
  days: DAYS.map((d) => d.value),
  timesPerWeek: 3,
  reminderOn: false,
  reminderTime: "08:00",
};

type HabitFormContextValue = {
  openNew: () => void;
  openEdit: (habit: Habit) => void;
  /** Incrementa cada vez que se guarda/elimina un hábito — las pantallas
   * lo agregan a su dependencia de recarga para refrescarse sin necesidad
   * de navegar. */
  version: number;
};

const HabitFormContext = createContext<HabitFormContextValue | null>(null);

export function useHabitForm(): HabitFormContextValue {
  const ctx = useContext(HabitFormContext);
  if (!ctx) throw new Error("useHabitForm debe usarse dentro de HabitFormProvider");
  return ctx;
}

export function HabitFormProvider({ children }: { children: ReactNode }) {
  const { categories, reload: reloadCategories } = useCategories();
  const { version: categoryVersion } = useCategoryForm();

  useEffect(() => {
    if (categoryVersion > 0) reloadCategories();
  }, [categoryVersion, reloadCategories]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [existingReminderId, setExistingReminderId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [version, setVersion] = useState(0);

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  }

  function openNew() {
    setEditing(null);
    setExistingReminderId(null);
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditing(habit);
    const metric = habit.metrics[0];
    setForm({
      name: habit.name,
      categoryId: habit.category_id ? String(habit.category_id) : "",
      trackingType: habit.tracking_type,
      metricType: metric?.metric_type ?? "count",
      metricName: metric?.name ?? "",
      metricUnit: metric?.unit ?? "",
      metricGoal: metric ? fromStoredTargetValue(metric.metric_type, Number(metric.target_value ?? 0)) : 1,
      recurrenceType: habit.recurrence_type,
      days: habit.recurrence_rule ? parseRecurrenceRule(habit.recurrence_rule) : DAYS.map((d) => d.value),
      timesPerWeek: habit.quota_target ?? 3,
      reminderOn: false,
      reminderTime: "08:00",
    });
    setExistingReminderId(null);
    setError(null);
    setOpen(true);

    listReminders(habit.id)
      .then((reminders) => {
        if (reminders.length > 0) {
          setExistingReminderId(reminders[0].id);
          setForm((prev) => ({ ...prev, reminderOn: true, reminderTime: reminders[0].time_of_day }));
        }
      })
      .catch(() => {
        // Silencioso — el recordatorio es un detalle secundario del form, no bloquea la edición.
      });
  }

  async function syncReminder(habitId: number) {
    if (form.reminderOn) {
      if (existingReminderId) {
        await updateReminder(habitId, existingReminderId, form.reminderTime);
      } else {
        await createReminder(habitId, form.reminderTime);
      }
    } else if (existingReminderId) {
      await deleteReminder(habitId, existingReminderId);
    }
  }

  async function handleSave() {
    setError(null);
    setIsSubmitting(true);

    try {
      if (editing) {
        await updateHabit(editing.id, {
          name: form.name,
          category_id: form.categoryId ? Number(form.categoryId) : null,
          recurrence_rule: form.recurrenceType === "fixed" ? buildRecurrenceRule(form.days) : undefined,
          quota_target: form.recurrenceType === "quota" ? form.timesPerWeek : undefined,
          quota_period: form.recurrenceType === "quota" ? "week" : undefined,
        });

        const metric = editing.metrics[0];
        if (form.trackingType === "quantifiable" && metric) {
          await updateHabitMetric(editing.id, metric.id, {
            name: form.metricName,
            target_value: toStoredTargetValue(form.metricType, form.metricGoal),
          });
        }

        await syncReminder(editing.id);
      } else {
        const habit = await createHabit({
          name: form.name,
          category_id: form.categoryId ? Number(form.categoryId) : undefined,
          tracking_type: form.trackingType,
          recurrence_type: form.recurrenceType,
          recurrence_rule: form.recurrenceType === "fixed" ? buildRecurrenceRule(form.days) : undefined,
          quota_target: form.recurrenceType === "quota" ? form.timesPerWeek : undefined,
          quota_period: form.recurrenceType === "quota" ? "week" : undefined,
          metrics:
            form.trackingType === "quantifiable"
              ? [
                  {
                    name: form.metricName,
                    metric_type: form.metricType,
                    unit: form.metricType === "count" ? form.metricUnit : undefined,
                    currency_code: form.metricType === "currency" ? form.metricUnit.toUpperCase() : undefined,
                    target_value: toStoredTargetValue(form.metricType, form.metricGoal),
                  },
                ]
              : undefined,
        });

        if (form.reminderOn) {
          await createReminder(habit.id, form.reminderTime);
        }
      }

      setOpen(false);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el hábito.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm(`¿Eliminar el hábito "${editing.name}"? Esta acción no se puede deshacer.`)) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await deleteHabit(editing.id);
      setOpen(false);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el hábito.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleArchive() {
    if (!editing) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const updated =
        editing.status === "active" ? await archiveHabit(editing.id) : await unarchiveHabit(editing.id);
      setEditing(updated);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `No se pudo ${editing.status === "active" ? "archivar" : "reactivar"} el hábito.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <HabitFormContext.Provider value={{ openNew, openEdit, version }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              {editing ? "Editar hábito" : "Nuevo hábito"}
              {editing?.status === "archived" && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
                  Archivado
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="habit-name">Nombre del hábito</Label>
              <Input
                id="habit-name"
                required
                placeholder="Ej. Meditar 10 minutos"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Categoría</Label>
              <Select value={form.categoryId || "none"} onValueChange={(v) => set("categoryId", v === "none" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
                {(["binary", "quantifiable"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    disabled={!!editing}
                    className={cn(
                      "flex-1 rounded-md px-3 py-2 text-sm font-semibold",
                      form.trackingType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                      editing && "cursor-not-allowed opacity-60",
                    )}
                    onClick={() => set("trackingType", t)}
                  >
                    {t === "binary" ? "Binario (sí/no)" : "Cuantificable"}
                  </button>
                ))}
              </div>
              {editing && <p className="text-xs text-muted-foreground">El tipo no se puede cambiar después de crear el hábito.</p>}
            </div>

            {form.trackingType === "quantifiable" && (
              <div className="flex flex-col gap-2 rounded-md border border-border p-3">
                <Input
                  placeholder="Nombre de la métrica (ej. Páginas leídas)"
                  required
                  value={form.metricName}
                  onChange={(e) => set("metricName", e.target.value)}
                />
                <Select
                  value={form.metricType}
                  onValueChange={(v) => set("metricType", v as NewMetricInput["metric_type"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Cantidad (conteo)</SelectItem>
                    <SelectItem value="duration">Duración (minutos)</SelectItem>
                    <SelectItem value="currency">Monto (dinero)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{METRIC_TYPE_INFO[form.metricType].help}</p>
                <div className="flex gap-2">
                  {form.metricType !== "duration" && (
                    <Input
                      placeholder={form.metricType === "currency" ? "Moneda (ISO, ej. USD)" : "Unidad (ej. vasos, páginas)"}
                      className="flex-1"
                      maxLength={form.metricType === "currency" ? 3 : undefined}
                      value={form.metricUnit}
                      onChange={(e) =>
                        set("metricUnit", form.metricType === "currency" ? e.target.value.toUpperCase() : e.target.value)
                      }
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-1">
                    <Label className="text-xs font-normal text-muted-foreground">
                      {METRIC_TYPE_INFO[form.metricType].targetLabel}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={form.metricType === "currency" ? "0.01" : "1"}
                      placeholder={METRIC_TYPE_INFO[form.metricType].targetPlaceholder}
                      required
                      value={form.metricGoal}
                      onChange={(e) => set("metricGoal", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Recurrencia</Label>
              <div className="flex gap-1 rounded-lg border border-border bg-secondary p-1">
                {(["fixed", "quota"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    disabled={!!editing}
                    className={cn(
                      "flex-1 rounded-md px-3 py-2 text-sm font-semibold",
                      form.recurrenceType === r ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                      editing && "cursor-not-allowed opacity-60",
                    )}
                    onClick={() => set("recurrenceType", r)}
                  >
                    {r === "fixed" ? "Días fijos" : "Cuota semanal"}
                  </button>
                ))}
              </div>
              {editing && (
                <p className="text-xs text-muted-foreground">
                  El modo de recurrencia no se puede cambiar, pero sí sus valores (días u objetivo).
                </p>
              )}
            </div>

            {form.recurrenceType === "fixed" ? (
              <div className="flex gap-1.5">
                {DAYS.map((day) => {
                  const selected = form.days.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      className={cn(
                        "flex-1 rounded-lg py-2 text-xs font-bold",
                        selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                      )}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm">Veces por semana</span>
                <Input
                  type="number"
                  min={1}
                  max={7}
                  className="w-20"
                  value={form.timesPerWeek}
                  onChange={(e) => set("timesPerWeek", Number(e.target.value))}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="mb-0">Recordatorio</Label>
              <Switch checked={form.reminderOn} onCheckedChange={(v) => set("reminderOn", v)} />
            </div>
            {form.reminderOn && (
              <Input
                type="time"
                value={form.reminderTime}
                onChange={(e) => set("reminderTime", e.target.value)}
              />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="mt-2 flex flex-wrap gap-2">
              {editing && (
                <>
                  <Button type="button" variant="outline" onClick={handleToggleArchive} disabled={isSubmitting}>
                    {editing.status === "active" ? "Archivar" : "Reactivar"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                    Eliminar
                  </Button>
                </>
              )}
              <div className="flex-1" />
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSubmitting || !form.name.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </HabitFormContext.Provider>
  );
}
