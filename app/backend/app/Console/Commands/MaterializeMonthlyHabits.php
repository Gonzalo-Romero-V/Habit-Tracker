<?php

namespace App\Console\Commands;

use App\Models\Habit;
use App\Services\HabitOccurrenceMaterializer;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

/**
 * Job mensual de hábitos (ver decisions/architecture.md → Jobs). Evaluado
 * por timezone de cada usuario: cuando "hoy" es el último día del mes en
 * SU timezone, materializa las ocurrencias `pending` del mes siguiente
 * para sus hábitos `fixed` activos. Pensado para correr diariamente vía
 * el Scheduler — es idempotente, así que correrlo de más no duplica nada.
 *
 * La consolidación de habit_monthly_stats se agrega a este mismo comando
 * en el incremento 3 (misma operación mensual, no un job separado).
 */
class MaterializeMonthlyHabits extends Command
{
    protected $signature = 'habits:materialize-month';

    protected $description = 'Materializa las ocurrencias pending del próximo mes para hábitos fixed cuyo mes ya cerró en el timezone de su dueño';

    public function handle(HabitOccurrenceMaterializer $materializer): int
    {
        $totalCreated = 0;
        $habitsProcessed = 0;

        Habit::query()
            ->where('status', 'active')
            ->where('recurrence_type', 'fixed')
            ->with('user')
            ->chunkById(100, function ($habits) use ($materializer, &$totalCreated, &$habitsProcessed) {
                foreach ($habits as $habit) {
                    $today = CarbonImmutable::now($habit->user->timezone);

                    if ($today->day !== $today->daysInMonth) {
                        continue;
                    }

                    $nextMonthStart = $today->addMonthNoOverflow()->startOfMonth();
                    $nextMonthEnd = $nextMonthStart->endOfMonth();

                    $totalCreated += $materializer->materializeRange($habit, $nextMonthStart, $nextMonthEnd);
                    $habitsProcessed++;
                }
            });

        $this->info("Hábitos procesados: {$habitsProcessed}. Ocurrencias nuevas: {$totalCreated}.");

        return self::SUCCESS;
    }
}
