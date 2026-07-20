"use client";

import { apiFetch } from "@/lib/api";

export type HabitMetricLogEntry = {
  habit_metric_id: number;
  value: string;
};

export type HabitLogEntry = {
  id: number;
  habit_id: number;
  occurrence_date: string;
  status: "pending" | "completed" | "missed";
  completed_at: string | null;
  metrics: HabitMetricLogEntry[];
};

export type MetricValueInput = {
  habit_metric_id: number;
  value: number;
};

export function listHabitLogs(habitId: number) {
  return apiFetch<HabitLogEntry[]>(`/habits/${habitId}/logs?per_page=30`, { method: "GET" });
}

export function createHabitLog(
  habitId: number,
  input: { occurrence_date?: string; metrics?: MetricValueInput[] } = {},
) {
  return apiFetch<HabitLogEntry>(`/habits/${habitId}/logs`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateHabitLog(habitId: number, logId: number, metrics?: MetricValueInput[]) {
  return apiFetch<HabitLogEntry>(`/habits/${habitId}/logs/${logId}`, {
    method: "PATCH",
    body: JSON.stringify({ metrics }),
  });
}

export function deleteHabitLog(habitId: number, logId: number) {
  return apiFetch<null>(`/habits/${habitId}/logs/${logId}`, { method: "DELETE" });
}
