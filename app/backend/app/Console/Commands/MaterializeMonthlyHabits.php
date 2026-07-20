<?php

namespace App\Console\Commands;

use App\Models\Habit;
use App\Services\HabitMonthlyStatConsolidator;
use App\Services\HabitOccurrenceMaterializer;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

/**
 * Job mensual de hábitos (ver decisions/architecture.md → Jobs). Evaluado
 * por timezone de cada usuario: cuando "hoy" es el último día del mes en
 * SU timezone, (1) materializa las ocurrencias `pending` del mes
 * siguiente para hábitos `fixed` activos, y (2) consolida
 * habit_monthly_stats del mes que cierra para todos los hábitos activos
 * (fixed y quota) — misma operación mensual, no dos jobs separados (ver
 * domain/habit-log.md y domain/habit-monthly-stat.md). Pensado para
 * correr diariamente vía el Scheduler — es idempotente.
 */
class MaterializeMonthlyHabits extends Command
{
    protected $signature = 'habits:materialize-month';

    protected $description = 'Materializa ocurrencias del próximo mes (fixed) y consolida stats del mes que cierra, por timezone de usuario';

    public function handle(
        HabitOccurrenceMaterializer $materializer,
        HabitMonthlyStatConsolidator $consolidator,
    ): int {
        $totalCreated = 0;
        $habitsProcessed = 0;
        $statsConsolidated = 0;

        Habit::query()
            ->where('status', 'active')
            ->with('user')
            ->chunkById(100, function ($habits) use ($materializer, $consolidator, &$totalCreated, &$habitsProcessed, &$statsConsolidated) {
                foreach ($habits as $habit) {
                    $today = CarbonImmutable::now($habit->user->timezone);

                    if ($today->day !== $today->daysInMonth) {
                        continue;
                    }

                    if ($habit->recurrence_type === 'fixed') {
                        $nextMonthStart = $today->addMonthNoOverflow()->startOfMonth();
                        $nextMonthEnd = $nextMonthStart->endOfMonth();
                        $totalCreated += $materializer->materializeRange($habit, $nextMonthStart, $nextMonthEnd);
                    }

                    $consolidator->consolidate($habit, $today->year, $today->month);
                    $statsConsolidated++;
                    $habitsProcessed++;
                }
            });

        $this->info("Hábitos procesados: {$habitsProcessed}. Ocurrencias nuevas: {$totalCreated}. Stats consolidados: {$statsConsolidated}.");

        return self::SUCCESS;
    }
}
