<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Ver decisions/architecture.md → Jobs. Diario para materializar (evalúa
// internamente si "hoy" es fin de mes en el timezone de cada usuario);
// frecuente para cerrar ocurrencias vencidas y recalcular streaks.
Schedule::command('habits:materialize-month')->dailyAt('23:50');
Schedule::command('habits:evaluate-closures')->everyThirtyMinutes();
Schedule::command('habits:dispatch-due-reminders')->everyMinute();
