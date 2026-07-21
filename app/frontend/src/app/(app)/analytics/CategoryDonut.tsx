import type { Habit } from "@/hooks/useHabits";
import type { Category } from "@/hooks/useCategories";

type CategoryDonutProps = {
  habits: Habit[];
  categories: Category[];
};

type Slice = { key: string; label: string; color: string; count: number };

/** Dona de categorías vía CSS conic-gradient, construida a partir de los
 * hábitos activos agrupados por category_id. Cada categoría usa su propio
 * color (definido por el usuario en Categorías) — nunca un color inventado —
 * así la identidad de color es consistente con el resto de la app. Los
 * hábitos sin categoría se agrupan en "Sin categoría" con un color neutro,
 * en vez de excluirse, para que el total de la leyenda siempre sume el total
 * de hábitos activos. */
export function CategoryDonut({ habits, categories }: CategoryDonutProps) {
  const total = habits.length;

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay hábitos activos para mostrar.</p>;
  }

  const counts = new Map<number | null, number>();
  habits.forEach((h) => counts.set(h.category_id, (counts.get(h.category_id) ?? 0) + 1));

  const slices: Slice[] = [];
  categories.forEach((c) => {
    const count = counts.get(c.id);
    if (count) slices.push({ key: String(c.id), label: c.name, color: c.color ?? "var(--chart-1)", count });
  });
  const uncategorized = counts.get(null) ?? 0;
  if (uncategorized > 0) {
    slices.push({ key: "none", label: "Sin categoría", color: "var(--muted-foreground)", count: uncategorized });
  }

  let acc = 0;
  const stops = slices.map((s) => {
    const start = (acc / total) * 360;
    acc += s.count;
    const end = (acc / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  });
  const gradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative size-32 shrink-0 rounded-full" style={{ backgroundImage: gradient }}>
        <div className="absolute inset-[22%] rounded-full bg-card" />
      </div>
      <ul className="flex min-w-[140px] flex-1 flex-col gap-1.5">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="text-muted-foreground">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
