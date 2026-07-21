<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DeviceTokenController;
use App\Http\Controllers\Api\V1\HabitController;
use App\Http\Controllers\Api\V1\HabitLogController;
use App\Http\Controllers\Api\V1\HabitMetricController;
use App\Http\Controllers\Api\V1\HabitMonthlyStatController;
use App\Http\Controllers\Api\V1\ReminderController;
use App\Http\Controllers\Api\V1\StatsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/google', [AuthController::class, 'google']);

    Route::middleware(['auth:sanctum', 'sync.timezone'])->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::patch('auth/me', [AuthController::class, 'updateMe']);

        Route::apiResource('categories', CategoryController::class);

        Route::apiResource('habits', HabitController::class);
        Route::post('habits/{habit}/archive', [HabitController::class, 'archive']);
        Route::post('habits/{habit}/unarchive', [HabitController::class, 'unarchive']);
        Route::apiResource('habits.metrics', HabitMetricController::class)
            ->only(['store', 'update', 'destroy'])
            ->parameters(['metrics' => 'metric'])
            ->scoped();
        Route::apiResource('habits.logs', HabitLogController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['logs' => 'log'])
            ->scoped();
        Route::apiResource('habits.reminders', ReminderController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->scoped();
        Route::get('habits/{habit}/stats/monthly', [HabitMonthlyStatController::class, 'index']);

        Route::post('device-tokens', [DeviceTokenController::class, 'store']);
        Route::delete('device-tokens/{deviceToken}', [DeviceTokenController::class, 'destroy']);

        Route::get('stats/today', [StatsController::class, 'today']);
        Route::get('stats/daily', [StatsController::class, 'daily']);
        Route::get('stats/monthly-trend', [StatsController::class, 'monthlyTrend']);
        Route::get('stats/first-log-date', [StatsController::class, 'firstLogDate']);
    });
});
