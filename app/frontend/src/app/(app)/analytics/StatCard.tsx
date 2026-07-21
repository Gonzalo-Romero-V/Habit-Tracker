type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

/** Tarjeta de estadística simple: etiqueta + número grande + subtítulo opcional
 * (ej. el nombre del hábito dueño de una racha). Sigue el vocabulario visual
 * de `categories/page.tsx` (rounded-2xl, border-border, bg-card). */
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card px-4 py-3.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-semibold leading-tight">{value}</span>
      {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
