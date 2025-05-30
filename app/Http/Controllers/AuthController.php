<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Connexion de l'utilisateur et génération d'un token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Inscription d'un nouvel utilisateur (enseignant ou étudiant).
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:4',
            'role' => 'required|in:enseignant,etudiant,admin',
        ]);

        // Créer l'utilisateur
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }

    /**
     * Déconnexion de l'utilisateur (révocation du token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Deconnexion réussie'], 200);
    }
}

// namespace App\Http\Controllers;

// use App\Models\User;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Log;

// class AuthController extends Controller
// {
//     /**
//      * Connexion de l'utilisateur et génération d'un token.
//      */
//     public function login(Request $request)
//     {
//         $request->validate([
//             'email' => 'required|email',
//             'password' => 'required|string',
//         ]);

//         if (!Auth::attempt($request->only('email', 'password'))) {
//             return response()->json(['error' => 'Invalid credentials'], 401);
//         }

//         $user = Auth::user();
//         $token = $user->createToken('auth_token')->plainTextToken;

//         return response()->json([
//             'token' => $token,
//             'user' => [
//                 'id' => $user->id,
//                 'name' => $user->name,
//                 'email' => $user->email,
//                 'role' => $user->role,
//             ],
//         ], 200);
//     }

//     /**
//      * Inscription d'un nouvel utilisateur (enseignant ou étudiant).
//      */
//     public function register(Request $request)
//     {
//         Log::info('Register request received', $request->all());

//         try {
//             $validated = $request->validate([
//                 'name' => 'required|string|max:255',
//                 'email' => 'required|email|unique:users,email',
//                 'password' => 'required|string|min:8',
//                 'role' => 'required|in:teacher,student',
//             ]);

//             Log::info('Validation passed', $validated);

//             $user = User::create([
//                 'name' => $request->name,
//                 'email' => $request->email,
//                 'password' => Hash::make($request->password),
//                 'role' => $request->role,
//             ]);

//             Log::info('User created', ['user_id' => $user->id]);

//             $token = $user->createToken('auth_token')->plainTextToken;

//             return response()->json([
//                 'token' => $token,
//                 'user' => [
//                     'id' => $user->id,
//                     'name' => $user->name,
//                     'email' => $user->email,
//                     'role' => $user->role,
//                 ],
//             ], 201);
//         } catch (\Exception $e) {
//             Log::error('Registration error', ['error' => $e->getMessage()]);
//             return response()->json(['error' => 'Registration failed', 'message' => $e->getMessage()], 500);
//         }
//     }

//     /**
//      * Déconnexion de l'utilisateur (révocation du token).
//      */
//     public function logout(Request $request)
//     {
//         $request->user()->currentAccessToken()->delete();
//         return response()->json(['message' => 'Déconnexion réussie'], 200);
//     }
// }
