<?php

namespace App\Services\Push;

use App\Models\DeviceToken;

/**
 * Transporte de push notifications — ver decisions/stack.md. La
 * implementación real (FCM) llega cuando existan credenciales de
 * Firebase; hasta entonces se usa LogPushSender (ver AppServiceProvider).
 */
interface PushSender
{
    public function send(DeviceToken $token, string $title, string $body): void;
}
