<?php

namespace App\Services\Push;

use App\Models\DeviceToken;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

/**
 * Transporte real de push notifications vía Firebase Cloud Messaging
 * (HTTP v1 API) — ver decisions/stack.md. Reemplaza a LogPushSender ahora
 * que existe el proyecto de Firebase (habittracker-7be67).
 *
 * Las excepciones del SDK de kreait (token inválido/no registrado, fallo
 * de red, etc.) se dejan subir sin capturar acá: quien orquesta el loop de
 * despacho (DispatchDueReminders) decide qué hacer si un token falla, este
 * servicio solo sabe mandar.
 */
class FcmPushSender implements PushSender
{
    public function __construct(private readonly Messaging $messaging) {}

    public function send(DeviceToken $token, string $title, string $body): void
    {
        $message = CloudMessage::new()
            ->withToken($token->push_token)
            ->withNotification(Notification::create($title, $body));

        $this->messaging->send($message);
    }
}
