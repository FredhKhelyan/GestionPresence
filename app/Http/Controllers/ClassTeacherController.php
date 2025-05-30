<?php

namespace App\Http\Controllers;

use App\Models\ClassTeacher;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Http\Request;

class ClassTeacherController extends Controller
{
    /**
     * Lister toutes les associations classe-enseignant (admin uniquement).
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $associations = ClassTeacher::with(['classe', 'enseignant'])->get();
        return response()->json($associations ?: ['message' => 'No class-teacher associations found']);
    }

    /**
     * Créer une nouvelle association classe-enseignant (admin uniquement).
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'teacher_id' => 'required|exists:users,id',
        ]);

        $teacher = User::findOrFail($request->teacher_id);
        if ($teacher->role !== 'enseignant') {
            return response()->json(['error' => 'User must have teacher role'], 422);
        }

        // Vérifier si l'association existe déjà
        if (ClassTeacher::where('class_id', $request->class_id)
            ->where('teacher_id', $request->teacher_id)
            ->exists()
        ) {
            return response()->json(['error' => 'This teacher is already assigned to this class'], 422);
        }

        $association = ClassTeacher::create([
            'class_id' => $request->class_id,
            'teacher_id' => $request->teacher_id,
        ]);

        return response()->json($association->load(['classe', 'enseignant']), 201);
    }

    /**
     * Afficher une association spécifique (admin uniquement).
     */
    public function show(Request $request, ClassTeacher $classTeacher)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        return response()->json($classTeacher->load(['classe', 'enseignant']));
    }

    /**
     * Supprimer une association classe-enseignant (admin uniquement).
     */
    public function destroy(Request $request, ClassTeacher $classTeacher)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $classTeacher->delete();
        return response()->json(null, 204);
    }
}