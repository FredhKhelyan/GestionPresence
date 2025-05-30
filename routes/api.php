<?php

// use App\Http\Controllers\AuthController;
// use App\Http\Controllers\ClasseController;
// use App\Http\Controllers\StudentController;
// use App\Http\Controllers\PresenceController;
// use App\Http\Controllers\ClassTeacherController;
// use Illuminate\Support\Facades\Route;

// /*
// |--------------------------------------------------------------------------
// | API Routes
// |--------------------------------------------------------------------------
// |
// | Here is where you can register API routes for your application. These
// | routes are loaded by the RouteServiceProvider within a group which
// | is assigned the "api" prefix.
// |
// */

// // Routes publiques (pas d'authentification)
// Route::post('/login', [AuthController::class, 'login']);
// Route::post('/register', [AuthController::class, 'register']);

// // Routes protégées (authentification requise)
// Route::middleware(['auth:sanctum'])->group(function () {
//     // Déconnexion
//     Route::post('/logout', [AuthController::class, 'logout']);

//     // Routes pour admins
//     Route::middleware('role:admin')->group(function () {
//         // Gestion des classes
//         Route::apiResource('classes', ClasseController::class);

//         // Gestion des étudiants
//         Route::apiResource('students', StudentController::class);
//         Route::put('/students/{student}/assign-class', [StudentController::class, 'assignClass']);

//         // Gestion des présences
//         Route::apiResource('presences', PresenceController::class);
//         Route::get('/presences/class/{class}', [PresenceController::class, 'classPresences']);

//         // Gestion des associations classe-enseignant
//         Route::apiResource('class-teachers', ClassTeacherController::class)->except(['update']);
//     });

//     // Routes pour étudiants
//     Route::middleware('role:etudiant')->group(function () {
//         Route::post('/students/enroll', [StudentController::class, 'enroll']);
//         Route::get('/my-presences', [PresenceController::class, 'myPresences']);
//     });

//     // Routes pour enseignants
//     Route::middleware('role:enseignant')->group(function () {
//         Route::post('/presences', [PresenceController::class, 'store']);
//         Route::get('/teacher-classes', [PresenceController::class, 'teacherClasses']);
//     });
// });<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\ClassTeacherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" prefix.
|
*/

// Routes publiques (pas d'authentification)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Routes protégées (authentification requise)
Route::middleware(['auth:sanctum'])->group(function () {
    // Déconnexion
    Route::post('/logout', [AuthController::class, 'logout']);

    // Gestion des classes (admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/classes', [ClasseController::class, 'index']);
        Route::post('/classes', [ClasseController::class, 'NewClasse']); // À renommer store
        Route::get('/classes/{class}', [ClasseController::class, 'show']);
        Route::put('/classes/{class}', [ClasseController::class, 'update']);
        Route::delete('/classes/{class}', [ClasseController::class, 'destroy']);
    });

    // Gestion des étudiants (admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/students', [StudentController::class, 'index']);
        Route::post('/students', [StudentController::class, 'store']);
        Route::get('/students/{student}', [StudentController::class, 'show']);
        Route::put('/students/{student}', [StudentController::class, 'update']);
        Route::delete('/students/{student}', [StudentController::class, 'destroy']);
        Route::put('/students/{student}/assign-class', [StudentController::class, 'assignClass']);
    });

    // Gestion des présences (admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/presences', [PresenceController::class, 'index']);
        Route::get('/presences/{presence}', [PresenceController::class, 'show']);
        Route::put('/presences/{presence}', [PresenceController::class, 'update']);
        Route::delete('/presences/{presence}', [PresenceController::class, 'destroy']);
        Route::get('/presences/class/{class}', [PresenceController::class, 'classPresences']);
    });

    // Gestion des associations classe-enseignant (admin)
    Route::middleware('role:admin')->group(function () {
        Route::get('/class-teachers', [ClassTeacherController::class, 'index']);
        Route::post('/class-teachers', [ClassTeacherController::class, 'store']);
        Route::get('/class-teachers/{classTeacher}', [ClassTeacherController::class, 'show']);
        Route::delete('/class-teachers/{classTeacher}', [ClassTeacherController::class, 'destroy']);
    });

    // Routes pour étudiants
    Route::middleware('role:student')->group(function () {
        Route::post('/students/enroll', [StudentController::class, 'enroll']);
        Route::get('/my-presences', [PresenceController::class, 'myPresences']);
    });

    // Routes pour enseignants
    Route::middleware('role:teacher')->group(function () {
        Route::post('/presences', [PresenceController::class, 'store']);
        Route::get('/teacher-classes', [PresenceController::class, 'teacherClasses']);
    });
});
