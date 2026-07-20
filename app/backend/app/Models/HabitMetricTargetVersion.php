<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HabitMetricTargetVersion extends Model
{
    protected $fillable = [
        'habit_metric_id',
        'target_value',
        'effective_from',
    ];

    protected function casts(): array
    {
        return [
            'target_value' => 'decimal:2',
            'effective_from' => 'date',
        ];
    }

    public function habitMetric(): BelongsTo
    {
        return $this->belongsTo(HabitMetric::class);
    }
}
