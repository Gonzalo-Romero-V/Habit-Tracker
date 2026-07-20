<?php

namespace App\Console\Commands;

use App\Models\Habit;
use App\Models\HabitLog;
use App\Services\StreakService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

/**
 * Evalúa cierres de tiempo por timezone de usuario (ver decisions/
 * architecture.md → Jobs). Pensado para correr frecuente vía el
 * Scheduler (cada 15-60 min):
 *   1. `fixed`: ocurrencias `pending` cuyo día ya cerró → `missed`.
 *   2. `quota`: recalcula streak de todos los hábitos activos — el
 *      StreakService ya solo evalúa semanas completamente cerradas, así
 *      que re-correr esto de más es seguro (idempotente), simplemente no
 *      encuentra semanas nuevas que cerrar.
 */
class EvaluateHabitClosures extends Command
{
    protected $signature = 'habits:evaluate-closures';

    protected $description = 'Marca ocurrencias fixed vencidas como missed y recalcula streaks';

    public function handle(StreakService $streaks): int
    {
        $missedCount = 0;
        $affectedFixedHabits = [];

        HabitLog::query()
            ->where('status', 'pending')
            ->whereHas('habit', fn ($q) => $q->where('recurrence_type', 'fixed'))
            ->with('habit.user')
            ->chunkById(200, function ($logs) use (&$missedCount, &$affectedFixedHabits) {
                foreach ($logs as $log) {
                    $timezone = $log->habit->user->timezone;
                    $todayInTz = CarbonImmutable::now($timezone)->toDateString();

                    if ($log->occurrence_date->toDateString() < $todayInTz) {
                        $log->update(['status' => 'missed']);
                        $affectedFixedHabits[$log->habit_id] = $log->habit;
                        $missedCount++;
                    }
                }
            });

        foreach ($affectedFixedHabits as $habit) {
            $streaks->recalculate($habit);
        }

        $quotaHabitsCount = 0;
        Habit::query()
            ->where('status', 'active')
            ->where('recurrence_type', 'quota')
            ->chunkById(200, function ($habits) use ($streaks, &$quotaHabitsCount) {
                foreach ($habits as $habit) {
                    $streaks->recalculate($habit);
                    $quotaHabitsCount++;
                }
            });

        $this->info("Ocurrencias marcadas missed: {$missedCount}. Hábitos quota re-evaluados: {$quotaHabitsCount}.");

        return self::SUCCESS;
    }
}
