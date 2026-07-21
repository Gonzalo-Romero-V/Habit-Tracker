"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const ONBOARDING_PATH = "/onboarding";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Señal de "onboarding pendiente" (ver domain/user.md → Onboarding): no
  // hay un flag separado, birth_date === null ya la representa. OJO: el
  // wizard de /onboarding setea birth_date en su segundo paso (de cinco) —
  // si esta señal se re-evalúa en vivo, el usuario queda expulsado de su
  // propio flujo apenas guarda la fecha, antes de llegar a categoría/
  // hábito/tour. Por eso "¿puede seguir en /onboarding?" se decide una
  // sola vez al entrar a la ruta (ref), no en cada cambio de `user`.
  const needsOnboarding = !!user && user.birth_date === null;
  const isOnboardingRoute = pathname === ONBOARDING_PATH;

  const wasOnboardingNeededOnEntry = useRef(needsOnboarding);
  if (!isOnboardingRoute) {
    // Fuera de /onboarding la señal siempre debe reflejar el valor real —
    // solo se "congela" mientras se está adentro del flujo.
    wasOnboardingNeededOnEntry.current = needsOnboarding;
  }

  const blockedFromOnboarding = isOnboardingRoute && !wasOnboardingNeededOnEntry.current;

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (needsOnboarding && !isOnboardingRoute) {
      // Cualquier pantalla de la app con birth_date todavía sin capturar
      // manda al usuario al onboarding en curso.
      router.replace(ONBOARDING_PATH);
      return;
    }

    if (blockedFromOnboarding) {
      // Entró a /onboarding sin necesitarlo desde el vamos (ya lo había
      // completado antes) — a diferencia de "lo estoy completando ahora
      // mismo", eso sí se bloquea.
      router.replace("/today");
    }
  }, [isLoading, user, needsOnboarding, isOnboardingRoute, blockedFromOnboarding, router]);

  if (isLoading || !user) {
    return null;
  }

  // Evita el flash de contenido mientras el efecto de arriba dispara el
  // replace hacia la ruta correcta.
  if ((needsOnboarding && !isOnboardingRoute) || blockedFromOnboarding) {
    return null;
  }

  return <>{children}</>;
}
