import { CalendarDays, ChartColumn, Hourglass, Sun } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/today", label: "Hoy", icon: Sun },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/mori", label: "Memento Mori", icon: Hourglass },
  { href: "/analytics", label: "Análisis", icon: ChartColumn },
] as const;
