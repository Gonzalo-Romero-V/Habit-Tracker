<?php

namespace App\Services;

use App\Models\Habit;
use App\Models\HabitMonthlyStat;
use Carbon\CarbonImmutable;

/**
 * Consolida el agregado-cache de un hábito para un mes calendario ya
 * cerrado — ver domain/habit-monthly-stat.md. Siempre recalculable desde
 * HabitLog, nunca fuente de verdad.
 */
class HabitMonthlyStatConsolidator
{
    public function consolidate(Habit $habit, int $year, int $month): void
    {
        $start = CarbonImmutable::create($year, $month, 1)->startOfMonth();
        $end = $start->endOfMonth();

        $logs = $habit->logs()
            ->whereBetween('occurrence_date', [$start->toDateString(), $end->toDateString()])
            ->get(['status']);

        $quotaVersion = $habit->recurrence_type === 'quota'
            ? $habit->quotaVersionEffectiveOn($end->toDateString())
            : null;

        HabitMonthlyStat::updateOrCreate(
            ['habit_id' => $habit->id, 'year' => $year, 'month' => $month],
            [
                'completed_count' => $logs->where('status', 'completed')->count(),
                'missed_count' => $logs->where('status', 'missed')->count(),
                'recurrence_rule_snapshot' => $habit->recurrence_type === 'fixed' ? $habit->recurrence_rule : null,
                'quota_target_snapshot' => $quotaVersion?->quota_target,
                'quota_period_snapshot' => $quotaVersion?->quota_period,
            ],
        );
    }
}
