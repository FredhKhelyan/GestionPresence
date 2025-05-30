<?php

namespace App\Http\Controllers;

use App\Models\ClassTeacher;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Http\Request;

class ClassTeacherController extends Controller
{
    public function listClassTeacher(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $associations = ClassTeacher::with(['classe', 'teacher'])->get();
        return response()->json($associations ?: ['message' => 'Aucune association classe-enseignant trouvée']);
    }

    public function NewClassTeacher(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'teacher_id' => 'required|exists:users,id',
        ]);

        $teacher = User::findOrFail($request->teacher_id);
        if ($teacher->role !== 'enseignant') {
            return response()->json(['error' => 'L\'utilisateur doit avoir le rôle enseignant'], 422);
        }

        if (ClassTeacher::where('class_id', $request->class_id)
            ->where('teacher_id', $request->teacher_id)
            ->exists()
        ) {
            return response()->json(['error' => 'Cet enseignant est déjà assigné à cette classe'], 422);
        }

        $association = ClassTeacher::create([
            'class_id' => $request->class_id,
            'teacher_id' => $request->teacher_id,
        ]);

        return response()->json($association->load(['classe', 'teacher']), 201);
    }

    public function specialClassTeacher(Request $request, ClassTeacher $classTeacher)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        return response()->json($classTeacher->load(['classe', 'teacher']));
    }

    public function supprimerClassTeacher(Request $request, ClassTeacher $classTeacher)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $classTeacher->delete();
        return response()->json(null, 204);
    }
}
