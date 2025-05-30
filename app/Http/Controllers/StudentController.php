<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Lister tous les étudiants (admin uniquement).
     */
    public function listStudent(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $students = Student::with(['classe', 'user'])->get();
        return response()->json($students ?: ['message' => 'Aucun étudiant trouvé']);
    }

    /**
     * Afficher un étudiant spécifique (admin uniquement).
     */
    public function showStudent(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        return $student->load(['classe', 'user']);
    }

    /**
     * Mettre à jour un étudiant (admin uniquement).
     */
    public function updateStudent(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'class_id' => 'nullable|exists:classes,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($request->user_id);
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'L\'utilisateur doit avoir le rôle étudiant'], 422);
        }

        if ($user->student && $user->student->id !== $student->id) {
            return response()->json(['error' => 'Cet utilisateur est déjà lié à un autre profil étudiant'], 422);
        }

        $student->update([
            'user_id' => $request->user_id,
            'class_id' => $request->class_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
        ]);

        return response()->json($student->load(['classe', 'user']));
    }

    /**
     * Supprimer un étudiant (admin uniquement).
     */
    public function supprimerStudent(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $student->delete();
        return response()->json(null, 204);
    }

    /**
     * Assigner une classe à un étudiant (admin uniquement).
     */
    public function assignClass(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $request->validate([
            'class_id' => 'required|exists:classes,id',
        ]);

        $student->update([
            'class_id' => $request->class_id,
        ]);

        return response()->json($student->load(['classe', 'user']));
    }

    /**
     * Inscription d'un étudiant par lui-même.
     */
    public function enroll(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'Non autorisé : Étudiant uniquement'], 403);
        }

        if ($user->student) {
            return response()->json(['error' => 'Vous êtes déjà inscrit'], 422);
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'class_id' => 'nullable|exists:classes,id', // Optionnel
        ]);

        $lastStudent = Student::orderBy('id', 'desc')->first();
        $nextNumber = $lastStudent ? (int) str_replace('IUT-', '', $lastStudent->matricule) + 1 : 1;
        $matricule = 'IUT-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $student = Student::create([
            'user_id' => $user->id,
            'class_id' => $request->class_id, // Peut être null
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'matricule' => $matricule,
        ]);

        return response()->json($student->load(['classe', 'user']), 201);
    }
}