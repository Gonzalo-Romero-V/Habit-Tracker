<?php

namespace App\Providers;

use App\Services\Push\FcmPushSender;
use App\Services\Push\PushSender;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Envío real vía FCM — ver decisions/stack.md. El binding es un
        // class-string (resolución perezosa de Laravel): la credencial de
        // Firebase (FIREBASE_CREDENTIALS) solo se lee cuando algo resuelve
        // PushSender de verdad (ej. DispatchDueReminders al correr), nunca
        // en el boot de la app — así que su ausencia no rompe requests que
        // no despachan push.
        $this->app->bind(PushSender::class, FcmPushSender::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
