<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HabitMonthlyStat extends Model
{
    protected $fillable = [
        'habit_id',
        'year',
        'month',
        'completed_count',
        'missed_count',
        'recurrence_rule_snapshot',
        'quota_target_snapshot',
        'quota_period_snapshot',
    ];

    public function habit(): BelongsTo
    {
        return $this->belongsTo(Habit::class);
    }
}
