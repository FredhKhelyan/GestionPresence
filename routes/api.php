<?php

    use App\Http\Controllers\AuthController;
    use App\Http\Controllers\ClasseController;
    use App\Http\Controllers\StudentController;
    use App\Http\Controllers\PresenceController;
    use App\Http\Controllers\ClassTeacherController;
    use App\Http\Controllers\TeacherController;
    use App\Http\Controllers\NotificationController;
    use App\Http\Controllers\StatsController;
    use App\Http\Controllers\ClassesController;
    use Illuminate\Support\Facades\Route;

    // routes publiques vers la connexion et l'inscription des utilisateurs du systeme
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Routes protégées par le middleware d'authentification vers les differents controllers
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::get('/teacher', [AuthController::class, 'teacher']);
        Route::get('/actor', [AuthController::class, 'actor']);

        // Routes vers la gestion des classes(Admin uniquement)
        Route::get('/listClasse', [ClasseController::class, 'listClasse']);
        Route::post('/NewClasse', [ClasseController::class, 'NewClasse']);
        Route::get('/SpecialClasse/{class}', [ClasseController::class, 'SpecialClasse']);
        Route::put('/MAJClasse/{class}', [ClasseController::class, 'MAJClasse']);
        Route::delete('/SupprimerClasse/{class}', [ClasseController::class, 'SupprimerClasse']);

        // Routes vers la gestion des étudiants (Admin uniquement)
        Route::get('/listStudent', [StudentController::class, 'listStudent']);
        // Route::post('/students', [StudentController::class, 'store']);
        Route::get('/showStudent/{student}', [StudentController::class, 'showStudent']);
        Route::put('/updateStudent/{student}', [StudentController::class, 'updateStudent']);
        Route::delete('/supprimerStudent/{student}', [StudentController::class, 'supprimerStudent']);
        Route::put('/students/{student}/assignClass', [StudentController::class, 'assignClass']);

        // Route::controller('App\Http\Controllers\StudentController')->group(function () {
        //     Route::get('/students', 'listStudent');
        //     Route::post('/students', 'store');
        //     Route::get('/students/{student}', 'showStudent');
        //     Route::put('/students/{student}', 'updateStudent');
        //     Route::delete('/students/{student}', 'supprimerStudent');
        //     Route::put('/students/{student}/assignClass', 'assignClass');
        // })->middleware('auth:sanctum');

        // Routes vers la gestion des présences (Enseignant et Admin)
        Route::get('/index', [PresenceController::class, 'index']);
        Route::post('/store', [PresenceController::class, 'store']);
        Route::get('/show/{presence}', [PresenceController::class, 'show']);
        Route::put('/update/{presence}', [PresenceController::class, 'update']);
        Route::delete('/destroy/{presence}', [PresenceController::class, 'destroy']);
        Route::get('/presences/class/{class}', [PresenceController::class, 'classPresences']);
        Route::get('/presences/StudentPresence', [PresenceController::class, 'StudentPresence']);

        // Routes vers la gestion des enseignants (Admin uniquement)
        Route::get('/listClassTeacher', [ClassTeacherController::class, 'listClassTeacher']);
        Route::post('/NewClassTeacher', [ClassTeacherController::class, 'NewClassTeacher']);
        Route::get('/specialClassTeacher/{classTeacher}', [ClassTeacherController::class, 'specialClassTeacher']);
        Route::delete('/supprimerClassTeacher/{classTeacher}', [ClassTeacherController::class, 'supprimerClassTeacher']);

        // Routes pour les étudiants
        Route::post('/students/enroll', [StudentController::class, 'enroll']);
        Route::get('/student/MonProfil', [StudentController::class, 'MonProfil']);
        Route::get('/myPresences', [PresenceController::class, 'myPresences']);


        // Routes pour les enseignants
        Route::get('/teacherClasses', [PresenceController::class, 'teacherClasses']);
        Route::get('/teacher/profile', [TeacherController::class, 'getProfile']);
        Route::get('/teacher/classes', [TeacherController::class, 'getClasses']);
        Route::get('/teacher/stats', [TeacherController::class, 'getStats']);
        Route::get('/classes/{id}/students', [ClassesController::class, 'getStudents']);



    // Routes pour les notifications
    Route::get('/AllNotifications', [NotificationController::class, 'AllNotifications']);
        Route::put('/markAsRead/{id}/read', [NotificationController::class, 'markAsRead']);

        // Routes pour les statistiques (Admin uniquement)
        Route::get('/stats', [StatsController::class, 'stats']);
    });
