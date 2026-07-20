"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  variant?: "icon" | "full";
};

export function ThemeToggle({ variant = "icon" }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return variant === "icon" ? (
      <Button variant="outline" size="icon" disabled aria-hidden />
    ) : (
      <Button variant="ghost" className="justify-start gap-2" disabled aria-hidden />
    );
  }

  const isDark = resolvedTheme === "dark";

  function toggle() {
    const next = isDark ? "light" : "dark";
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  }

  const Icon = isDark ? Sun : Moon;

  if (variant === "full") {
    return (
      <Button variant="ghost" className="justify-start gap-2 text-muted-foreground" onClick={toggle}>
        <Icon className="size-4" />
        <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={toggle} aria-label="Cambiar tema">
      <Icon className="size-4" />
    </Button>
  );
}
