<?php

namespace App\Http\Requests\Habit;

use Illuminate\Foundation\Http\FormRequest;

class StoreHabitLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'occurrence_date' => ['sometimes', 'date'],
            'metrics' => ['sometimes', 'array'],
            'metrics.*.habit_metric_id' => ['required_with:metrics', 'integer'],
            'metrics.*.value' => ['required_with:metrics', 'numeric', 'min:0'],
        ];
    }
}
