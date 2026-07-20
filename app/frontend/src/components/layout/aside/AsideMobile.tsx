"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useHabitForm } from "@/components/custom/HabitFormProvider";
import { cn } from "@/lib/utils";

const [today, calendar, mori, analytics] = NAV_ITEMS;

export function AsideMobile() {
  const pathname = usePathname();
  const { openNew } = useHabitForm();

  function NavButton({ item }: { item: (typeof NAV_ITEMS)[number] }) {
    const active = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={cn(
          "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10.5px] font-semibold",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
        {item.label === "Memento Mori" ? "Mori" : item.label}
      </Link>
    );
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 items-center border-t border-border bg-background px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 md:hidden">
      <NavButton item={today} />
      <NavButton item={calendar} />
      <button
        type="button"
        onClick={openNew}
        aria-label="Nuevo hábito"
        className="mx-auto flex size-13 -translate-y-3.5 items-center justify-center rounded-full bg-gradient-to-br from-brand to-primary text-primary-foreground shadow-lg"
      >
        <Plus className="size-6" />
      </button>
      <NavButton item={mori} />
      <NavButton item={analytics} />
    </nav>
  );
}
