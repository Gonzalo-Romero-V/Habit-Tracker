<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeviceToken\StoreDeviceTokenRequest;
use App\Http\Resources\DeviceTokenResource;
use App\Models\DeviceToken;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Registrar/refrescar el token del dispositivo actual — upsert por
     * `push_token` (ver domain/device-token.md → last_seen_at).
     */
    public function store(StoreDeviceTokenRequest $request)
    {
        $token = DeviceToken::updateOrCreate(
            ['push_token' => $request->validated('push_token')],
            [
                'user_id' => $request->user()->id,
                'platform' => $request->validated('platform'),
                'last_seen_at' => now(),
            ],
        );

        return (new DeviceTokenResource($token))
            ->additional(['mensaje' => 'Dispositivo registrado correctamente.'])
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Request $request, DeviceToken $deviceToken)
    {
        $this->authorize('delete', $deviceToken);

        $deviceToken->delete();

        return response()->json([
            'data' => null,
            'mensaje' => 'Dispositivo eliminado correctamente.',
        ]);
    }
}
