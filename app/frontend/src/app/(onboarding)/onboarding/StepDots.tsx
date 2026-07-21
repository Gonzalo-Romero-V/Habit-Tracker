import { cn } from "@/lib/utils";

/** Indicador de progreso del onboarding — puntos simples, sin traer el
 * componente `Progress` de shadcn (no estaba instalado y esto alcanza para
 * "cuántos pasos faltan"). */
export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-6 bg-primary" : i < current ? "w-1.5 bg-primary/50" : "w-1.5 bg-secondary",
          )}
        />
      ))}
    </div>
  );
}
