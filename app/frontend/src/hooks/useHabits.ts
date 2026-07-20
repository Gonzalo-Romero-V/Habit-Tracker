"use client";

import { apiFetch } from "@/lib/api";

export type HabitMetric = {
  id: number;
  habit_id: number;
  name: string;
  metric_type: "count" | "duration" | "currency";
  unit: string | null;
  currency_code: string | null;
  target_value: string | null;
  created_at: string;
};

export type Habit = {
  id: number;
  category_id: number | null;
  name: string;
  tracking_type: "binary" | "quantifiable";
  status: "active" | "archived";
  recurrence_type: "fixed" | "quota";
  recurrence_rule: string | null;
  quota_target: number | null;
  quota_period: "week" | null;
  current_streak: number;
  best_streak: number;
  metrics: HabitMetric[];
  created_at: string;
};

type PaginatedMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type NewMetricInput = {
  name: string;
  metric_type: "count" | "duration" | "currency";
  unit?: string;
  currency_code?: string;
  target_value: number;
};

export type NewHabitInput = {
  name: string;
  category_id?: number | null;
  tracking_type: "binary" | "quantifiable";
  recurrence_type: "fixed" | "quota";
  recurrence_rule?: string;
  quota_target?: number;
  quota_period?: "week";
  metrics?: NewMetricInput[];
};

export function listHabits(status?: string) {
  const query = status ? `?status=${status}` : "";

  return apiFetch<Habit[]>(`/habits${query}`, { method: "GET" });
}

export function createHabit(input: NewHabitInput) {
  return apiFetch<Habit>("/habits", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function archiveHabit(id: number) {
  return apiFetch<Habit>(`/habits/${id}/archive`, { method: "POST" });
}

export function deleteHabit(id: number) {
  return apiFetch<null>(`/habits/${id}`, { method: "DELETE" });
}

export type { PaginatedMeta };
