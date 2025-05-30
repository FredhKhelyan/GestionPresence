<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use App\Models\Classe;
use App\Models\Student;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    /**
     * Afficher toutes les présences (admin uniquement).
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        return Presence::with(['student', 'student.user', 'student.classe'])->get();
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
        $classe = $student->classe;

        // Vérifier que l'utilisateur est admin ou enseignant de la classe
        if ($user->role !== 'admin') {
            if ($user->role !== 'teacher' || !$classe->teachers()->where('users.id', $user->id)->exists()) {
                return response()->json(['error' => 'Unauthorized: Not assigned to this class'], 403);
            }
        }

        // Vérifier si une présence existe déjà pour cet étudiant à cette date
        if (Presence::where('student_id', $request->student_id)->where('date', $request->date)->exists()) {
            return response()->json(['error' => 'Presence already recorded for this student on this date'], 422);
        }

        $presence = Presence::create([
            'student_id' => $request->student_id,
            'date' => $request->date,
            'status' => $request->status,
        ]);

        return response()->json($presence->load(['student', 'student.user', 'student.classe']), 201);
    }

    /**
     * Afficher une présence spécifique (admin uniquement).
     */
    public function show(Request $request, Presence $presence)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        return $presence->load(['student', 'student.user', 'student.classe']);
    }

    /**
     * Mettre à jour une présence (admin uniquement).
     */
    public function update(Request $request, Presence $presence)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent',
        ]);

        // Vérifier si une autre présence existe pour cet étudiant à cette date
        if (Presence::where('student_id', $request->student_id)
            ->where('date', $request->date)
            ->where('id', '!=', $presence->id)
            ->exists()
        ) {
            return response()->json(['error' => 'Presence already recorded for this student on this date'], 422);
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
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $presence->delete();
        return response()->json(null, 204);
    }

    /**
     * Afficher les présences d'une classe spécifique (admin uniquement).
     */
    public function classPresences(Request $request, Classe $class)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $date = $request->query('date'); // Filtre optionnel par date
        $query = Presence::whereHas('student', function ($q) use ($class) {
            $q->where('class_id', $class->id);
        })->with(['student', 'student.user', 'student.classe']);

        if ($date) {
            $query->where('date', $date);
        }

        $presences = $query->get();
        return response()->json($presences ?: ['message' => 'No presences found for this class']);
    }

    /**
     * Afficher les présences d'un étudiant connecté.
     */
    public function myPresences(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'Unauthorized: Student only'], 403);
        }

        $student = $user->student;
        if (!$student) {
            return response()->json(['error' => 'No student profile linked'], 404);
        }

        $presences = Presence::where('student_id', $student->id)
            ->with(['student', 'student.user', 'student.classe'])
            ->get();

        return response()->json($presences);
    }

    /**
     * Lister les classes assignées à un enseignant pour faire l'appel.
     */
    public function teacherClasses(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'enseignant') {
            return response()->json(['error' => 'Unauthorized: Teacher only'], 403);
        }

        $classes = $user->classes()->withCount('students')->get();
        return response()->json($classes);
    }
}
