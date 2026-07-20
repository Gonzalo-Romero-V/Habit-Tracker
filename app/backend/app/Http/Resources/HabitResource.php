<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HabitResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $quotaVersion = $this->recurrence_type === 'quota' ? $this->currentQuotaVersion() : null;

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'tracking_type' => $this->tracking_type,
            'status' => $this->status,
            'recurrence_type' => $this->recurrence_type,
            'recurrence_rule' => $this->recurrence_type === 'fixed' ? $this->recurrence_rule : null,
            'quota_target' => $quotaVersion?->quota_target,
            'quota_period' => $quotaVersion?->quota_period,
            'current_streak' => $this->current_streak,
            'best_streak' => $this->best_streak,
            'metrics' => HabitMetricResource::collection($this->whenLoaded('metrics')),
            'created_at' => $this->created_at,
        ];
    }
}
