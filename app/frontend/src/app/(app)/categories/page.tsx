"use client";

import { useState, type FormEvent } from "react";
import { useCategories } from "@/hooks/useCategories";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CategoriesPage() {
  const { categories, isLoading, error, createCategory, deleteCategory } = useCategories();
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createCategory({ name, color: color || null });
      setName("");
      setColor("");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo crear la categoría.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number, categoryName: string) {
    if (!window.confirm(`¿Eliminar la categoría "${categoryName}"?`)) return;
    setFormError(null);
    setDeletingId(id);
    try {
      await deleteCategory(id);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Categorías</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nueva categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="#22C55E"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear categoría"}
            </Button>
          </form>
          {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tus categorías</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!isLoading && !error && categories.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no tienes categorías.</p>
          )}
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-4 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: category.color ?? "transparent" }}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === category.id}
                  onClick={() => handleDelete(category.id, category.name)}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
