"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useCategories, type Category } from "@/hooks/useCategories";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Hex equivalentes de los hues OKLCH del diseño — el backend valida
 * `color` como hex (ver domain/category.md), no OKLCH, así que se
 * convierte acá en vez de tocar la validación por una decisión de
 * paleta visual. */
const SWATCHES = [
  { hue: 150, hex: "#16A34A" },
  { hue: 320, hex: "#A21CAF" },
  { hue: 250, hex: "#2563EB" },
  { hue: 55, hex: "#D97706" },
  { hue: 30, hex: "#DC2626" },
  { hue: 190, hex: "#0D9488" },
];

type CategoryFormContextValue = {
  openNew: () => void;
  openEdit: (category: Category) => void;
  /** Incrementa en cada guardado/borrado — screens que traen su propia
   * instancia de useCategories() la usan para saber cuándo recargar. */
  version: number;
};

const CategoryFormContext = createContext<CategoryFormContextValue | null>(null);

export function useCategoryForm(): CategoryFormContextValue {
  const ctx = useContext(CategoryFormContext);
  if (!ctx) throw new Error("useCategoryForm debe usarse dentro de CategoryFormProvider");
  return ctx;
}

export function CategoryFormProvider({ children }: { children: ReactNode }) {
  const { createCategory, updateCategory, deleteCategory } = useCategories();
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SWATCHES[0].hex);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openNew() {
    setEditing(null);
    setName("");
    setColor(SWATCHES[0].hex);
    setError(null);
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setColor(category.color ?? SWATCHES[0].hex);
    setError(null);
    setOpen(true);
  }

  async function handleSave() {
    setError(null);
    setIsSubmitting(true);
    try {
      if (editing) {
        await updateCategory(editing.id, { name, color });
      } else {
        await createCategory({ name, color });
      }
      setOpen(false);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la categoría.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm(`¿Eliminar la categoría "${editing.name}"?`)) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteCategory(editing.id);
      setOpen(false);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CategoryFormContext.Provider value={{ openNew, openEdit, version }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editing ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                required
                placeholder="Ej. Salud"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map(({ hue, hex }) => {
                  const selected = color === hex;
                  return (
                    <button
                      key={hue}
                      type="button"
                      className={cn(
                        "size-8 cursor-pointer rounded-full border-2 transition-transform",
                        selected ? "scale-110 border-foreground" : "border-transparent",
                      )}
                      style={{ backgroundColor: hex }}
                      onClick={() => setColor(hex)}
                      aria-label={`Color ${hue}`}
                    />
                  );
                })}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="mt-2 flex gap-2">
              {editing && (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                  Eliminar
                </Button>
              )}
              <div className="flex-1" />
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSubmitting || !name.trim()}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CategoryFormContext.Provider>
  );
}
