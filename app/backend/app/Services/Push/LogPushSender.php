<?php

namespace App\Services\Push;

use App\Models\DeviceToken;
use Illuminate\Support\Facades\Log;

/**
 * Stub de PushSender — sin credenciales de Firebase todavía (ver
 * decisions/stack.md). Solo loguea, no llama a ningún servicio externo.
 * El resto del sistema (qué recordatorio está vencido, a qué
 * dispositivos despachar) es lógica real, no stubeada.
 */
class LogPushSender implements PushSender
{
    public function send(DeviceToken $token, string $title, string $body): void
    {
        Log::info('[stub push] Se enviaría notificación', [
            'device_token_id' => $token->id,
            'platform' => $token->platform,
            'title' => $title,
            'body' => $body,
        ]);
    }
}
