<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Si el request autenticado trae X-Client-Timezone y difiere del valor
 * guardado, actualiza User::timezone oportunistamente (ver domain/user.md).
 */
class SyncClientTimezone
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('X-Client-Timezone');
        $user = $request->user();

        if ($header && $user && $header !== $user->timezone && in_array($header, timezone_identifiers_list(), true)) {
            $user->update(['timezone' => $header]);
        }

        return $next($request);
    }
}
