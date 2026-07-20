"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function HeaderMobile() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <span className="text-sm font-semibold">Habit Tracker</span>
      {user && (
        <Button variant="outline" size="sm" onClick={() => logout()}>
          Salir
        </Button>
      )}
    </header>
  );
}
