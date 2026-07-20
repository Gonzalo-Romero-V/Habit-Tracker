<?php

namespace App\Http\Requests\Stats;

use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class DailyStatsRequest extends FormRequest
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
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ];
    }

    /**
     * Rango máximo de 2 años por request — evita un request patológico
     * sobre el historial completo de una cuenta vieja (ver
     * decisions/api-contracts.md).
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->filled('from') || ! $this->filled('to')) {
                return;
            }

            $from = CarbonImmutable::parse($this->input('from'));
            $to = CarbonImmutable::parse($this->input('to'));

            if ($from->diffInDays($to) > 730) {
                $validator->errors()->add('to', 'El rango entre from y to no puede superar 2 años.');
            }
        });
    }
}
