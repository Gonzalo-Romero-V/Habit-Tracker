<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HabitMetric extends Model
{
    protected $fillable = [
        'habit_id',
        'name',
        'metric_type',
        'unit',
        'currency_code',
    ];

    public function habit(): BelongsTo
    {
        return $this->belongsTo(Habit::class);
    }

    public function targetVersions(): HasMany
    {
        return $this->hasMany(HabitMetricTargetVersion::class);
    }

    public function currentTargetVersion(): ?HabitMetricTargetVersion
    {
        return $this->targetVersions()->orderByDesc('effective_from')->first();
    }

    /**
     * La versión del target_value vigente en una fecha dada — nunca el
     * valor actual, ver domain/habit-metric.md → versionado.
     */
    public function targetVersionEffectiveOn(string $date): ?HabitMetricTargetVersion
    {
        return $this->targetVersions()
            ->whereDate('effective_from', '<=', $date)
            ->orderByDesc('effective_from')
            ->first();
    }
}
