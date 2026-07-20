<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HabitLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'habit_id' => $this->habit_id,
            'occurrence_date' => $this->occurrence_date->toDateString(),
            'status' => $this->status,
            'completed_at' => $this->completed_at,
            'metrics' => HabitMetricLogResource::collection($this->whenLoaded('metricLogs')),
        ];
    }
}
