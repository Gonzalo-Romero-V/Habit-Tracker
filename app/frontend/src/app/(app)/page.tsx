"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AppHomePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-lg font-semibold">Hola, {user?.name}</h1>
      <p className="text-sm text-muted-foreground">
        Todavía no hay hábitos configurados.
      </p>
    </div>
  );
}
