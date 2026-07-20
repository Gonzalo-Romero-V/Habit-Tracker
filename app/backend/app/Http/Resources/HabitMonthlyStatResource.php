<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HabitMonthlyStatResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'year' => $this->year,
            'month' => $this->month,
            'completed_count' => $this->completed_count,
            'missed_count' => $this->missed_count,
            'recurrence_rule_snapshot' => $this->recurrence_rule_snapshot,
            'quota_target_snapshot' => $this->quota_target_snapshot,
            'quota_period_snapshot' => $this->quota_period_snapshot,
        ];
    }
}
