"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Cake,
  ChartColumn,
  ChevronLeft,
  Compass,
  Hourglass,
  ListChecks,
  Sparkles,
  Sun,
  Tag,
} from "lucide-react";
import { useAuth, updateProfile } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { listHabits } from "@/hooks/useHabits";
import { useCategoryForm } from "@/components/custom/CategoryFormProvider";
import { useHabitForm } from "@/components/custom/HabitFormProvider";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepDots } from "./StepDots";

type StepId = "welcome" | "birthdate" | "category" | "habit" | "tour";

/** Misma convención de "fecha local" que el resto de la app (ver
 * today/page.tsx) — evita el corrimiento de un día que da `toISOString()`
 * cerca de la medianoche por usar UTC. */
function todayLocalDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TOUR_ITEMS = [
  { icon: Sun, label: "Hoy", desc: "Marca tus hábitos del día y sigue tu racha." },
  { icon: CalendarDays, label: "Calendario", desc: "Revisa tu historial día a día." },
  { icon: Hourglass, label: "Memento Mori", desc: "Visualiza tu vida en semanas — un recordatorio para aprovechar el tiempo." },
  { icon: ChartColumn, label: "Análisis", desc: "Consulta tendencias y estadísticas de tus hábitos." },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { openNew: openNewCategory, version: categoryVersion } = useCategoryForm();
  const { openNew: openNewHabit, version: habitVersion } = useHabitForm();

  const [habitsCount, setHabitsCount] = useState<number | null>(null);
  useEffect(() => {
    listHabits()
      .then((habits) => setHabitsCount(habits.length))
      .catch(() => setHabitsCount(0));
  }, []);

  // La lista de pasos se calcula una sola vez, cuando ya sabemos si el
  // usuario tiene categorías/hábitos previos (caso raro: alguien con datos
  // pero birth_date todavía null) — así no se le pide crear una segunda
  // categoría/hábito de forma redundante.
  const [steps, setSteps] = useState<StepId[] | null>(null);
  useEffect(() => {
    if (steps !== null || categoriesLoading || habitsCount === null) return;
    const next: StepId[] = ["welcome", "birthdate"];
    if (categories.length === 0) next.push("category");
    if (habitsCount === 0) next.push("habit");
    next.push("tour");
    setSteps(next);
  }, [steps, categoriesLoading, habitsCount, categories.length]);

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps?.[stepIndex];

  function goNext() {
    setStepIndex((i) => (steps ? Math.min(i + 1, steps.length - 1) : i));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  // Auto-avanzar cuando el usuario guarda una categoría/hábito desde el
  // modal reutilizado — `version` es la señal que exponen esos providers.
  // Si el usuario solo cierra el modal con "Cancelar", version no cambia y
  // el paso se queda esperando (misma UX que "Omitir por ahora").
  const seenCategoryVersion = useRef(categoryVersion);
  useEffect(() => {
    if (categoryVersion > seenCategoryVersion.current) {
      seenCategoryVersion.current = categoryVersion;
      if (currentStep === "category") goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryVersion]);

  const seenHabitVersion = useRef(habitVersion);
  useEffect(() => {
    if (habitVersion > seenHabitVersion.current) {
      seenHabitVersion.current = habitVersion;
      if (currentStep === "habit") goNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitVersion]);

  // --- Paso: fecha de nacimiento ---
  const [birthDate, setBirthDate] = useState("");
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [isSavingBirthDate, setIsSavingBirthDate] = useState(false);

  async function handleSaveBirthDate() {
    if (!birthDate) return;
    setBirthDateError(null);
    setIsSavingBirthDate(true);
    try {
      const updated = await updateProfile({ birth_date: birthDate });
      setUser(updated);
      goNext();
    } catch (err) {
      setBirthDateError(err instanceof ApiError ? err.message : "No se pudo guardar tu fecha de nacimiento.");
    } finally {
      setIsSavingBirthDate(false);
    }
  }

  function finishOnboarding() {
    router.replace("/today");
  }

  if (!user || !steps || !currentStep) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Preparando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 p-6">
      <StepDots total={steps.length} current={stepIndex} />

      {currentStep === "welcome" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-primary text-primary-foreground">
            <Sparkles className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">¡Bienvenido a Habit Tracker!</h1>
          <p className="text-sm text-muted-foreground">
            Este es tu espacio para construir hábitos que se queden contigo. Antes de empezar, vamos a
            configurar tu cuenta en un par de pasos rápidos.
          </p>
          <Button size="lg" className="mt-2 w-full bg-gradient-to-br from-brand to-primary text-primary-foreground" onClick={goNext}>
            Comenzar
          </Button>
        </div>
      )}

      {currentStep === "birthdate" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Cake className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">Cuéntanos cuándo naciste</h1>
          <p className="text-sm text-muted-foreground">
            Usamos tu fecha de nacimiento para Memento Mori, la vista que te ayuda a visualizar tu vida en
            semanas. Es un dato necesario, así que no puedes continuar sin ingresarlo.
          </p>

          <div className="flex w-full flex-col gap-2 text-left">
            <Label htmlFor="onboarding-birth-date">Fecha de nacimiento</Label>
            <Input
              id="onboarding-birth-date"
              type="date"
              required
              max={todayLocalDateString()}
              min="1900-01-01"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            {birthDateError && <p className="text-sm text-destructive">{birthDateError}</p>}
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!birthDate || isSavingBirthDate}
            onClick={handleSaveBirthDate}
          >
            {isSavingBirthDate ? "Guardando..." : "Guardar y continuar"}
          </Button>
        </div>
      )}

      {currentStep === "category" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Tag className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">Crea tu primera categoría</h1>
          <p className="text-sm text-muted-foreground">
            Las categorías agrupan tus hábitos (ej. Salud, Trabajo, Estudio). Crea una para empezar a
            organizar los tuyos — puedes crear más después.
          </p>
          <Button size="lg" className="w-full" onClick={openNewCategory}>
            Crear categoría
          </Button>
          <Button variant="ghost" onClick={goNext}>
            Omitir por ahora
          </Button>
        </div>
      )}

      {currentStep === "habit" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ListChecks className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">Crea tu primer hábito</h1>
          <p className="text-sm text-muted-foreground">
            Ahora arma el hábito que quieres empezar a seguir. Puedes editarlo cuando quieras desde la
            pestaña Hoy.
          </p>
          <Button size="lg" className="w-full" onClick={openNewHabit}>
            Crear hábito
          </Button>
          <Button variant="ghost" onClick={goNext}>
            Omitir por ahora
          </Button>
        </div>
      )}

      {currentStep === "tour" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="size-7" />
          </div>
          <h1 className="font-heading text-2xl font-semibold">Así se organiza la app</h1>
          <p className="text-sm text-muted-foreground">Cuatro pestañas, cada una con su propósito.</p>

          <ul className="flex w-full flex-col gap-2.5 text-left">
            {TOUR_ITEMS.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                  <Icon className="size-4.5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            className="mt-2 w-full bg-gradient-to-br from-brand to-primary text-primary-foreground"
            onClick={finishOnboarding}
          >
            Empezar a usar la app
          </Button>
        </div>
      )}

      {stepIndex > 0 && (
        <Button variant="ghost" size="sm" className="mx-auto gap-1 text-muted-foreground" onClick={goBack}>
          <ChevronLeft className="size-4" />
          Atrás
        </Button>
      )}
    </div>
  );
}
