<?php

use App\Http\Middleware\SyncClientTimezone;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'sync.timezone' => SyncClientTimezone::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                $fields = $e->errors();
                $firstMessage = array_values($fields)[0][0] ?? 'Los datos enviados no son válidos.';

                return response()->json([
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'mensaje' => $firstMessage,
                        'fields' => $fields,
                    ],
                ], 422);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => [
                        'code' => 'UNAUTHENTICATED',
                        'mensaje' => 'Debes iniciar sesión para continuar.',
                    ],
                ], 401);
            }
        });
    })->create();
