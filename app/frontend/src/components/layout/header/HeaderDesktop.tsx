"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function HeaderDesktop() {
  const { user, logout } = useAuth();

  return (
    <header className="hidden h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6 md:flex">
      <span className="text-sm font-semibold">Habit Tracker</span>
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Cerrar sesión
          </Button>
        </div>
      )}
    </header>
  );
}
