<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Publicado explícitamente (el skeleton de Laravel no lo trae por
    | default y cae en 'allowed_origins' => ['*']). La API se autentica
    | con Bearer token (Sanctum), nunca con cookies, así que un '*' no abre
    | un hueco de sesión — pero como defensa en profundidad restringimos
    | el origen a los hosts del frontend declarados en .env, controlado
    | por variable (ver decisions/environments.md): si el backend alguna
    | vez quedara alcanzable desde fuera de esta máquina, ninguna otra
    | página podría ni siquiera intentar leer la respuesta desde el
    | browser. 'supports_credentials' se deja en false a propósito: no
    | usamos cookies de sesión para la API.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
