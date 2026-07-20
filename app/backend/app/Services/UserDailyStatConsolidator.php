<?php

namespace App\Services;

use App\Models\HabitLog;
use App\Models\User;
use App\Models\UserDailyStat;

/**
 * Consolida el agregado cross-hábito de un usuario para una fecha ya
 * cerrada — ver domain/user-daily-stat.md. "Debido" no distingue
 * recurrence_type: la sola existencia de un HabitLog esa fecha ya
 * significa que el hábito contaba para ese día (pre-generado en fixed,
 * creado al loguear en quota).
 */
class UserDailyStatConsolidator
{
    public function consolidate(User $user, string $date): void
    {
        $counts = $this->countForDate($user, $date);

        UserDailyStat::updateOrCreate(
            ['user_id' => $user->id, 'date' => $date],
            $counts,
        );
    }

    /**
     * Mismo conteo que `consolidate()`, sin persistir — usado para el
     * día en curso (nunca tiene fila propia, ver domain/user-daily-stat.md).
     *
     * @return array{due_count: int, completed_count: int}
     */
    public function countForDate(User $user, string $date): array
    {
        $counts = HabitLog::query()
            ->whereHas('habit', fn ($q) => $q->where('user_id', $user->id)->where('status', 'active'))
            ->where('occurrence_date', $date)
            ->selectRaw("count(*) as due_count, count(*) filter (where status = 'completed') as completed_count")
            ->first();

        return [
            'due_count' => (int) ($counts->due_count ?? 0),
            'completed_count' => (int) ($counts->completed_count ?? 0),
        ];
    }
}
