<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Habit extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'tracking_type',
        'status',
        'recurrence_type',
        'recurrence_rule',
        'current_streak',
        'best_streak',
    ];

    /**
     * Defaults a nivel Eloquent, no solo de columna — Postgres no repuebla
     * los defaults de columna en el objeto en memoria tras el INSERT
     * (`RETURNING` en el driver de Laravel solo trae el id), así que sin
     * esto la respuesta de `store()` devolvía status/streaks en null.
     */
    protected $attributes = [
        'status' => 'active',
        'current_streak' => 0,
        'best_streak' => 0,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(HabitMetric::class);
    }

    public function quotaVersions(): HasMany
    {
        return $this->hasMany(HabitQuotaVersion::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(HabitLog::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    public function monthlyStats(): HasMany
    {
        return $this->hasMany(HabitMonthlyStat::class);
    }

    public function currentQuotaVersion(): ?HabitQuotaVersion
    {
        return $this->quotaVersions()->orderByDesc('effective_from')->first();
    }

    /**
     * La versión de quota_target/quota_period vigente en una fecha dada —
     * nunca el valor actual, ver domain/habit.md → versionado.
     */
    public function quotaVersionEffectiveOn(string $date): ?HabitQuotaVersion
    {
        return $this->quotaVersions()
            ->whereDate('effective_from', '<=', $date)
            ->orderByDesc('effective_from')
            ->first();
    }
}
