<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\HabitController;
use App\Http\Controllers\Api\V1\HabitMetricController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/google', [AuthController::class, 'google']);

    Route::middleware(['auth:sanctum', 'sync.timezone'])->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::apiResource('categories', CategoryController::class);

        Route::apiResource('habits', HabitController::class);
        Route::post('habits/{habit}/archive', [HabitController::class, 'archive']);
        Route::apiResource('habits.metrics', HabitMetricController::class)
            ->only(['store', 'update', 'destroy'])
            ->parameters(['metrics' => 'metric']);
    });
});
