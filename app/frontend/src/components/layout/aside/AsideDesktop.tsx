"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Plus, Tag } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useHabitForm } from "@/components/custom/HabitFormProvider";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/custom/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AsideDesktop() {
  const pathname = usePathname();
  const { openNew } = useHabitForm();
  const { logout } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-dvh w-58 shrink-0 flex-col gap-1 border-r border-border p-3.5 md:flex">
      <div className="flex items-center gap-2 px-2.5 pb-4 pt-1.5">
        <div className="size-2.5 rounded-full bg-gradient-to-br from-brand to-primary" />
        <span className="font-heading text-lg font-semibold tracking-tight">HabitTracker</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold",
                active ? "bg-accent text-primary" : "text-secondary-foreground hover:bg-secondary",
              )}
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="my-3.5 h-px bg-border" />

      <Link
        href="/habits"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary"
      >
        <List className="size-4.5" />
        Todos los hábitos
      </Link>

      <Link
        href="/categories"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary"
      >
        <Tag className="size-4.5" />
        Categorías
      </Link>

      <div className="flex-1" />

      <Button className="mb-2 w-full justify-center gap-2 bg-gradient-to-br from-brand to-primary text-primary-foreground" onClick={openNew}>
        <Plus className="size-4" />
        Nuevo hábito
      </Button>

      <div className="flex items-center gap-1">
        <ThemeToggle variant="full" />
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => logout()}>
          Salir
        </Button>
      </div>
    </aside>
  );
}
