<?php

namespace App\Providers;

use App\Services\Push\LogPushSender;
use App\Services\Push\PushSender;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Stub hasta tener credenciales de Firebase — ver decisions/stack.md.
        $this->app->bind(PushSender::class, LogPushSender::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
