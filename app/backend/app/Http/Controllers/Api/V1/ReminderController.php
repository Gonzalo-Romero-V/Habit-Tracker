<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Habit\StoreReminderRequest;
use App\Http\Requests\Habit\UpdateReminderRequest;
use App\Http\Resources\ReminderResource;
use App\Models\Habit;
use App\Models\Reminder;

class ReminderController extends Controller
{
    public function index(Habit $habit)
    {
        $this->authorize('view', $habit);

        return ReminderResource::collection($habit->reminders);
    }

    public function store(StoreReminderRequest $request, Habit $habit)
    {
        $this->authorize('update', $habit);

        $reminder = $habit->reminders()->create([
            'time_of_day' => $request->validated('time_of_day'),
        ]);

        return (new ReminderResource($reminder))
            ->additional(['mensaje' => 'Recordatorio creado correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateReminderRequest $request, Habit $habit, Reminder $reminder)
    {
        $this->authorize('update', $habit);

        $reminder->update(['time_of_day' => $request->validated('time_of_day')]);

        return (new ReminderResource($reminder))
            ->additional(['mensaje' => 'Recordatorio actualizado correctamente.']);
    }

    public function destroy(Habit $habit, Reminder $reminder)
    {
        $this->authorize('update', $habit);

        $reminder->delete();

        return response()->json([
            'data' => null,
            'mensaje' => 'Recordatorio eliminado correctamente.',
        ]);
    }
}
