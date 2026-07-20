<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Habit\StoreHabitLogRequest;
use App\Http\Requests\Habit\UpdateHabitLogRequest;
use App\Http\Resources\HabitLogResource;
use App\Models\Habit;
use App\Models\HabitLog;
use App\Services\HabitCompletionService;
use App\Services\StreakService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class HabitLogController extends Controller
{
    public function index(Request $request, Habit $habit)
    {
        $this->authorize('view', $habit);

        $logs = $habit->logs()
            ->with('metricLogs')
            ->orderByDesc('occurrence_date')
            ->paginate();

        return response()->json([
            'data' => HabitLogResource::collection($logs->items()),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function store(StoreHabitLogRequest $request, Habit $habit)
    {
        $this->authorize('update', $habit);

        $occurrenceDate = $request->validated('occurrence_date')
            ?? CarbonImmutable::now($request->user()->timezone)->toDateString();

        if ($habit->logs()->where('occurrence_date', $occurrenceDate)->exists()) {
            throw ValidationException::withMessages([
                'occurrence_date' => ['Ya existe un registro para esa fecha — usa el endpoint de actualización.'],
            ]);
        }

        $log = $habit->logs()->create([
            'occurrence_date' => $occurrenceDate,
            'status' => 'pending',
        ]);

        $this->syncMetrics($log, $request->validated('metrics', []));

        app(HabitCompletionService::class)->evaluate($log);
        app(StreakService::class)->recalculate($habit);

        return (new HabitLogResource($log->fresh('metricLogs')))
            ->additional(['mensaje' => 'Registro creado correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateHabitLogRequest $request, Habit $habit, HabitLog $log)
    {
        $this->authorize('update', $habit);

        $this->syncMetrics($log, $request->validated('metrics', []));

        app(HabitCompletionService::class)->evaluate($log);
        app(StreakService::class)->recalculate($habit);

        return (new HabitLogResource($log->fresh('metricLogs')))
            ->additional(['mensaje' => 'Registro actualizado correctamente.']);
    }

    public function destroy(Habit $habit, HabitLog $log)
    {
        $this->authorize('update', $habit);

        $log->delete();

        app(StreakService::class)->recalculate($habit);

        return response()->json([
            'data' => null,
            'mensaje' => 'Registro eliminado correctamente.',
        ]);
    }

    /**
     * @param  array<int, array{habit_metric_id: int, value: float}>  $metrics
     */
    private function syncMetrics(HabitLog $log, array $metrics): void
    {
        foreach ($metrics as $metricInput) {
            $log->metricLogs()->updateOrCreate(
                ['habit_metric_id' => $metricInput['habit_metric_id']],
                ['value' => $metricInput['value']],
            );
        }
    }
}
