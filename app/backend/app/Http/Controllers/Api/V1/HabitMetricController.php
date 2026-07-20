<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Habit\StoreHabitMetricRequest;
use App\Http\Requests\Habit\UpdateHabitMetricRequest;
use App\Http\Resources\HabitMetricResource;
use App\Models\Habit;
use App\Models\HabitMetric;
use Illuminate\Support\Facades\Date;

class HabitMetricController extends Controller
{
    public function store(StoreHabitMetricRequest $request, Habit $habit)
    {
        $this->authorize('update', $habit);

        $metric = $habit->metrics()->create([
            'name' => $request->validated('name'),
            'metric_type' => $request->validated('metric_type'),
            'unit' => $request->validated('unit'),
            'currency_code' => $request->validated('currency_code'),
        ]);

        $metric->targetVersions()->create([
            'target_value' => $request->validated('target_value'),
            'effective_from' => Date::today()->toDateString(),
        ]);

        return (new HabitMetricResource($metric))
            ->additional(['mensaje' => 'Métrica agregada correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateHabitMetricRequest $request, Habit $habit, HabitMetric $metric)
    {
        $this->authorize('update', $habit);

        if ($request->has('name')) {
            $metric->update(['name' => $request->validated('name')]);
        }

        if ($request->has('target_value')) {
            $metric->targetVersions()->create([
                'target_value' => $request->validated('target_value'),
                'effective_from' => Date::today()->toDateString(),
            ]);
        }

        return (new HabitMetricResource($metric->fresh()))
            ->additional(['mensaje' => 'Métrica actualizada correctamente.']);
    }

    public function destroy(Habit $habit, HabitMetric $metric)
    {
        $this->authorize('update', $habit);

        $metric->delete();

        return response()->json([
            'data' => null,
            'mensaje' => 'Métrica eliminada correctamente.',
        ]);
    }
}
