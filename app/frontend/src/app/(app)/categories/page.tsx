"use client";

import { useEffect } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryForm } from "@/components/custom/CategoryFormProvider";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
  const { categories, isLoading, error, reload } = useCategories();
  const { openNew, openEdit, version } = useCategoryForm();

  useEffect(() => {
    if (version > 0) reload();
  }, [version, reload]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-semibold">Categorías</h1>
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="size-4" />
          Nueva
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!isLoading && !error && categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Todavía no tienes categorías.
        </div>
      )}

      <ul className="flex flex-col gap-2.5">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => openEdit(category)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left"
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: category.color ?? "var(--muted-foreground)" }}
              />
              <span className="flex-1 text-sm font-semibold">{category.name}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
