"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/custom/ThemeToggle";
import { Button } from "@/components/ui/button";

export function HeaderMobile() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const title = NAV_ITEMS.find((item) => item.href === pathname)?.label
    ?? (pathname === "/categories" ? "Categorías" : "Habit Tracker");

  return (
    <header
      className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 pb-3 pt-[calc(14px+env(safe-area-inset-top))] md:hidden"
    >
      <span className="font-heading text-lg font-semibold">{title}</span>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="icon" asChild>
          <Link href="/categories" aria-label="Categorías">
            <Tag className="size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="icon" onClick={() => logout()} aria-label="Cerrar sesión">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
