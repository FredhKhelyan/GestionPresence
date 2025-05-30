<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Afficher la liste des étudiants (admin uniquement).
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $students = Student::with(['classe', 'user'])->get();
        return response()->json($students ?: ['message' => 'No students found']);
    }

    /**
     * Créer un nouvel étudiant (admin uniquement).
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'class_id' => 'required|exists:classes,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($request->user_id);
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'User must have student role'], 422);
        }

        if ($user->student) {
            return response()->json(['error' => 'User is already enrolled as a student'], 422);
        }

        $lastStudent = Student::orderBy('id', 'desc')->first();
        $nextNumber = $lastStudent ? (int) str_replace('IUT-', '', $lastStudent->matricule) + 1 : 1;
        $matricule = 'IUT-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $student = Student::create([
            'user_id' => $request->user_id,
            'class_id' => $request->class_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'matricule' => $matricule,
        ]);

        return response()->json($student->load(['classe', 'user']), 201);
    }

    /**
     * Afficher un étudiant spécifique (admin uniquement).
     */
    public function show(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        return $student->load(['classe', 'user']);
    }

    /**
     * Mettre à jour un étudiant (admin uniquement).
     */
    public function update(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'class_id' => 'required|exists:classes,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
        ]);

        $user = User::findOrFail($request->user_id);
        if ($user->role !== 'student') {
            return response()->json(['error' => 'User must have student role'], 422);
        }

        if ($user->student && $user->student->id !== $student->id) {
            return response()->json(['error' => 'This user is already linked to another student record'], 422);
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
    public function destroy(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $student->delete();
        return response()->json(null, 204);
    }

    /**
     * Réaffecter un étudiant à une classe (admin uniquement).
     */
    public function assignClass(Request $request, Student $student)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
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
     * Enrôlement d'un étudiant par lui-même.
     */
    public function enroll(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['error' => 'Unauthorized: Student only'], 403);
        }

        if ($user->student) {
            return response()->json(['error' => 'You are already enrolled'], 422);
        }

        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
        ]);

        $lastStudent = Student::orderBy('id', 'desc')->first();
        $nextNumber = $lastStudent ? (int) str_replace('IUT-', '', $lastStudent->matricule) + 1 : 1;
        $matricule = 'IUT-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);

        $student = Student::create([
            'user_id' => $user->id,
            'class_id' => $request->class_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'matricule' => $matricule,
        ]);

        return response()->json($student->load(['classe', 'user']), 201);
    }
}
