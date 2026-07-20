<?php

namespace App\Services;

use App\Models\Habit;
use Carbon\CarbonImmutable;

/**
 * Recalcula current_streak/best_streak de un hábito desde el historial
 * completo de HabitLog — nunca de agregados (ver domain/habit.md y
 * domain/habit-log.md → Reglas de negocio). Se invoca tras cualquier
 * mutación de HabitLog y desde el job de cierre de ocurrencias vencidas.
 */
class StreakService
{
    public function recalculate(Habit $habit): void
    {
        [$current, $best] = $habit->recurrence_type === 'quota'
            ? $this->calculateQuota($habit)
            : $this->calculateFixed($habit);

        $habit->update([
            'current_streak' => $current,
            'best_streak' => $best,
        ]);
    }

    /**
     * @return array{0: int, 1: int} [current, best]
     */
    private function calculateFixed(Habit $habit): array
    {
        $logs = $habit->logs()
            ->whereIn('status', ['completed', 'missed'])
            ->orderBy('occurrence_date')
            ->get(['status']);

        $running = 0;
        $best = 0;

        foreach ($logs as $log) {
            if ($log->status === 'completed') {
                $running++;
                $best = max($best, $running);
            } else {
                $running = 0;
            }
        }

        return [$running, $best];
    }

    /**
     * @return array{0: int, 1: int} [current, best]
     */
    private function calculateQuota(Habit $habit): array
    {
        $timezone = $habit->user->timezone;
        $now = CarbonImmutable::now($timezone);

        // occurrence_date es una fecha de calendario pura (columna `date`,
        // sin hora) — no necesita conversión de timezone, usarla directo.
        // OJO: CarbonImmutable::parse($valor, $tz) IGNORA $tz cuando
        // $valor ya es un objeto Carbon con timezone propio (queda en
        // UTC) — se comprobó con un test real que esto rompía la
        // comparación de semanas por 5 horas. Por eso created_at sí usa
        // ->setTimezone() explícito más abajo, nunca parse(..., $tz).
        $completedCountsByWeek = [];
        foreach ($habit->logs()->where('status', 'completed')->get(['occurrence_date']) as $log) {
            $key = $log->occurrence_date->format('o-W');
            $completedCountsByWeek[$key] = ($completedCountsByWeek[$key] ?? 0) + 1;
        }

        $cursor = CarbonImmutable::parse($habit->created_at)
            ->setTimezone($timezone)
            ->startOfWeek(CarbonImmutable::MONDAY);
        $currentWeekStart = $now->startOfWeek(CarbonImmutable::MONDAY);

        $running = 0;
        $best = 0;

        while ($cursor->lt($currentWeekStart)) {
            $target = $habit->quotaVersionEffectiveOn($cursor->toDateString())?->quota_target;

            if ($target !== null) {
                $count = $completedCountsByWeek[$cursor->format('o-W')] ?? 0;

                if ($count >= $target) {
                    $running++;
                    $best = max($best, $running);
                } else {
                    $running = 0;
                }
            }

            $cursor = $cursor->addWeek();
        }

        return [$running, $best];
    }
}
