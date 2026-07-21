import { AuthGuard } from "@/components/custom/AuthGuard";
import { CategoryFormProvider } from "@/components/custom/CategoryFormProvider";
import { HabitFormProvider } from "@/components/custom/HabitFormProvider";

/**
 * Layout dedicado al flujo de onboarding — a propósito NO reutiliza
 * `(app)/layout.tsx` (sin `Aside`/`Header`, sin las 4 pestañas de
 * navegación) porque el onboarding es un flujo guiado de pantalla
 * completa: mostrar tabs que el usuario todavía no puede usar del todo
 * (no tiene categorías/hábitos) es confuso. Sí reutiliza `AuthGuard`,
 * `CategoryFormProvider` y `HabitFormProvider` porque los pasos de
 * categoría/hábito reusan los modales existentes de esos providers.
 */
export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <CategoryFormProvider>
        <HabitFormProvider>
          <div className="min-h-dvh bg-background">{children}</div>
        </HabitFormProvider>
      </CategoryFormProvider>
    </AuthGuard>
  );
}
