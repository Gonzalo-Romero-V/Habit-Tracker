"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export function HeaderDesktop() {
  const pathname = usePathname();
  const title = NAV_ITEMS.find((item) => item.href === pathname)?.label
    ?? (pathname === "/categories" ? "Categorías" : pathname.startsWith("/habits") ? "Hábitos" : "Habit Tracker");

  return (
    <header className="sticky top-0 z-5 hidden h-14 shrink-0 items-center border-b border-border bg-background px-6 md:flex">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">HabitTracker</div>
        <div className="font-heading text-lg font-semibold">{title}</div>
      </div>
    </header>
  );
}
