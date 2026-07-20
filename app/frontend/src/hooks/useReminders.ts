"use client";

import { apiFetch } from "@/lib/api";

export type ReminderEntry = {
  id: number;
  habit_id: number;
  time_of_day: string;
};

export function listReminders(habitId: number) {
  return apiFetch<ReminderEntry[]>(`/habits/${habitId}/reminders`, { method: "GET" });
}

export function createReminder(habitId: number, timeOfDay: string) {
  return apiFetch<ReminderEntry>(`/habits/${habitId}/reminders`, {
    method: "POST",
    body: JSON.stringify({ time_of_day: timeOfDay }),
  });
}

export function deleteReminder(habitId: number, reminderId: number) {
  return apiFetch<null>(`/habits/${habitId}/reminders/${reminderId}`, { method: "DELETE" });
}
