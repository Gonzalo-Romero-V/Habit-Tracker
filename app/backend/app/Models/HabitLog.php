<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HabitLog extends Model
{
    protected $fillable = [
        'habit_id',
        'occurrence_date',
        'status',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'occurrence_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function habit(): BelongsTo
    {
        return $this->belongsTo(Habit::class);
    }

    public function metricLogs(): HasMany
    {
        return $this->hasMany(HabitMetricLog::class);
    }
}
