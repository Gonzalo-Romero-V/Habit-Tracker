<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HabitMetricResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'habit_id' => $this->habit_id,
            'name' => $this->name,
            'metric_type' => $this->metric_type,
            'unit' => $this->unit,
            'currency_code' => $this->currency_code,
            'target_value' => $this->currentTargetVersion()?->target_value,
            'created_at' => $this->created_at,
        ];
    }
}
