<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use RRule\RRule;

/**
 * Valida que `recurrence_rule` sea una RRULE (RFC5545) que la librería
 * rlanvin/php-rrule pueda parsear — ver domain/habit.md y decisions/stack.md.
 */
class ValidRecurrenceRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('El campo :attribute debe ser una regla de recurrencia válida.');

            return;
        }

        try {
            new RRule($value);
        } catch (\Throwable) {
            $fail('El campo :attribute no es una regla de recurrencia (RRULE) válida.');
        }
    }
}
