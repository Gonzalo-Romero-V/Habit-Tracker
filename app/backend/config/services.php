<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        // Client web (login desde el navegador, Google Identity Services).
        'client_id' => env('GOOGLE_CLIENT_ID'),
        // Client del proyecto de Firebase, usado como serverClientId por el
        // Sign-In nativo de Android — vive en un proyecto GCP distinto al
        // de arriba porque el client Android (package+SHA-1) quedó
        // registrado ahí (ver decisions/stack.md). Google exige que el
        // client Android y el serverClientId estén en el mismo proyecto,
        // así que no puede ser el mismo valor que 'client_id'.
        'client_id_android' => env('GOOGLE_CLIENT_ID_ANDROID'),
    ],

];
