<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HabitMetricLog extends Model
{
    protected $fillable = [
        'habit_log_id',
        'habit_metric_id',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
        ];
    }

    public function habitLog(): BelongsTo
    {
        return $this->belongsTo(HabitLog::class);
    }

    public function habitMetric(): BelongsTo
    {
        return $this->belongsTo(HabitMetric::class);
    }
}
