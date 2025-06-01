<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use App\Models\Classe;
use App\Models\Student;
use Illuminate\Http\Request;

class PresenceController extends Controller
{

    // Affiche toutes les présences (admin uniquement).
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        return Presence::with(['student', 'student.user', 'student.classe'])->get();
    }

    // Cette fonction filter permet de lister les présences d'une classe spécifique
    public function StudentPresence(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $query = Presence::with(['student', 'student.user', 'student.classe']);

        if ($request->query('class_id')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('class_id', $request->query('class_id'));
            });
        }

        if ($request->query('date')) {
            $query->where('date', $request->query('date'));
        }

        $presences = $query->latest()->get();
        return response()->json($presences ?: ['message' => 'Aucune présence trouvée']);
    }
    /**
     * Enregistrer une présence (enseignant pour sa classe ou admin).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent',
        ]);

        $student = Student::findOrFail($request->student_id);

        if (!$student->class_id) {
            return response()->json(['error' => 'L\'étudiant n\'est pas assigné à une classe'], 422);
        }

        $classe = $student->classe;

        if ($user->role !== 'admin') {
            if ($user->role !== 'enseignant' || !$classe->teachers()->where('users.id', $user->id)->exists()) {
                return response()->json(['error' => 'Non autorisé : Vous devez être admin ou enseignant assigné à cette classe'], 403);
            }
        }

        if (Presence::where('student_id', $request->student_id)->where('date', $request->date)->exists()) {
            return response()->json(['error' => 'Présence déjà enregistrée pour cet étudiant à cette date'], 422);
        }

        $presence = Presence::create([
            'student_id' => $request->student_id,
            'date' => $request->date,
            'status' => $request->status,
        ]);

        // Créer notification pour admin
        if ($user->role !== 'admin') {
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'message' => "Nouvelle présence enregistrée pour {$student->first_name} {$student->last_name} ({$classe->name}, {$request->date}).",
                    'read' => false,
                ]);
            }
        }

        return response()->json($presence->load(['student', 'student.user', 'student.classe']), 201);
    }
        /**
         * Afficher une présence spécifique (admin uniquement).
         */
        public function show(Request $request, Presence $presence)
        {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
            }

            return $presence->load(['student', 'student.user', 'student.classe']);
        }
        /**
         * Mettre à jour une présence (admin uniquement).
         */
        public function update(Request $request, Presence $presence)
        {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
            }

            $request->validate([
                'student_id' => 'required|exists:students,id',
                'date' => 'required|date',
                'status' => 'required|in:present,absent',
            ]);

            if (Presence::where('student_id', $request->student_id)
                ->where('date', $request->date)
                ->where('id', '!=', $presence->id)
                ->exists()
            ) {
                return response()->json(['error' => 'Présence déjà enregistrée pour cet étudiant à cette date'], 422);
            }

            $presence->update([
                'student_id' => $request->student_id,
                'date' => $request->date,
                'status' => $request->status,
            ]);

            return response()->json($presence->load(['student', 'student.user', 'student.classe']));
        }
        /**
         * Supprimer une présence (admin uniquement).
         */
        public function destroy(Request $request, Presence $presence)
        {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
            }

            $presence->delete();
            return response()->json(null, 204);
        }
        /**
         * Afficher les présences d'une classe (admin uniquement).
         */
        public function classPresences(Request $request, Classe $class)
        {
            if ($request->user()->role !== 'admin') {
                return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
            }

            $date = $request->query('date');
            $query = Presence::whereHas('student', function ($q) use ($class) {
                $q->where('class_id', $class->id);
            })->with(['student', 'student.user', 'student.classe']);

            if ($date) {
                $query->where('date', $date);
            }

            $presences = $query->get();
            return response()->json($presences ?: ['message' => 'Aucune présence trouvée pour cette classe']);
        }
        /**
         * Afficher les présences de l'étudiant connecté.
         */
        public function myPresences(Request $request)
        {
            $user = $request->user();
            if ($user->role !== 'etudiant') {
                return response()->json(['error' => 'Non autorisé : Étudiant uniquement'], 403);
            }

            $student = $user->student;
            if (!$student) {
                return response()->json(['error' => 'Aucun profil étudiant lié'], 404);
            }

            $presences = Presence::where('student_id', $student->id)
                ->with(['student', 'student.user', 'student.classe'])
                ->get();

            return response()->json($presences);
        }
        /**
         * Afficher les classes de l'enseignant connecté.
         */
    public function teacherClasses(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'enseignant') {
            return response()->json(['error' => 'Non autorisé : Enseignant uniquement'], 403);
        }

        $classes = $user->classes()->withCount('students')->get();
        return response()->json($classes ?: ['message' => 'Aucune classe trouvée']);
    }
}
