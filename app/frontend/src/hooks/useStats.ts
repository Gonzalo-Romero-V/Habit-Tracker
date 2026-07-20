"use client";

import { apiFetch } from "@/lib/api";

export type TodayStat = {
  date: string;
  due_count: number;
  completed_count: number;
};

export type DailyStat = {
  date: string;
  due_count: number;
  completed_count: number;
};

export type MonthlyTrendPoint = {
  year: number;
  month: number;
  completed_count: number;
  missed_count: number;
};

export function getTodayStat() {
  return apiFetch<TodayStat>("/stats/today", { method: "GET" });
}

/** from/to en formato YYYY-MM-DD. Devuelve solo días ya cerrados con
 * datos (sin fila para "hoy" ni para días sin ningún hábito activo). */
export function getDailyStats(from: string, to: string) {
  return apiFetch<DailyStat[]>(`/stats/daily?from=${from}&to=${to}`, { method: "GET" });
}

export function getMonthlyTrend(months = 6) {
  return apiFetch<MonthlyTrendPoint[]>(`/stats/monthly-trend?months=${months}`, { method: "GET" });
}
