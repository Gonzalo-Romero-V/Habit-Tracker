<?php

namespace App\Services;

use App\Models\Habit;
use Carbon\CarbonImmutable;

/**
 * Materializa filas `pending` de HabitLog para un hábito `fixed` dentro de
 * un rango de fechas — ver domain/habit-log.md → Notas de implementación
 * (bootstrap síncrono al crear + job mensual usan el mismo mecanismo).
 * Idempotente: no duplica si la fila ya existe.
 */
class HabitOccurrenceMaterializer
{
    public function __construct(
        private readonly RecurrenceExpansionService $expansion,
    ) {}

    public function materializeRange(Habit $habit, CarbonImmutable $start, CarbonImmutable $end): int
    {
        $occurrences = $this->expansion->occurrencesBetween($habit, $start, $end);
        $created = 0;

        foreach ($occurrences as $date) {
            $log = $habit->logs()->firstOrCreate(
                ['occurrence_date' => $date->toDateString()],
                ['status' => 'pending'],
            );

            if ($log->wasRecentlyCreated) {
                $created++;
            }
        }

        return $created;
    }
}
