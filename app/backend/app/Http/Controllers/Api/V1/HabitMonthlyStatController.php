<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HabitMonthlyStatResource;
use App\Models\Habit;

class HabitMonthlyStatController extends Controller
{
    /**
     * Meses ya cerrados — el mes en curso se calcula al vuelo desde
     * HabitLog en el frontend, no vive acá (ver api-contracts.md).
     */
    public function index(Habit $habit)
    {
        $this->authorize('view', $habit);

        $stats = $habit->monthlyStats()->orderByDesc('year')->orderByDesc('month')->get();

        return HabitMonthlyStatResource::collection($stats);
    }
}
