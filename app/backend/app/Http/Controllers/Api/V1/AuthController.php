<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'timezone' => $request->validated('timezone'),
        ]);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $user->createToken($request->userAgent() ?? 'api')->plainTextToken,
            ],
            'mensaje' => 'Cuenta creada correctamente.',
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no coinciden con nuestros registros.'],
            ]);
        }

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $user->createToken($request->userAgent() ?? 'api')->plainTextToken,
            ],
            'mensaje' => 'Sesión iniciada correctamente.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'data' => null,
            'mensaje' => 'Sesión cerrada correctamente.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }
}
