<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Classe;
use Illuminate\Database\QueryException;

class TeacherClassesController extends Controller
{
    public function TeacherPresence(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->role !== 'enseignant') {
                return response()->json(['error' => 'Non autorisé : Enseignant uniquement'], 403);
            }

            $classes = $user->classes()->with(['students' => function ($query) {
                $query->select('id', 'first_name', 'last_name', 'class_id');
            }])->get(['id', 'name'])->map(function ($classe) {
                return [
                    'id' => $classe->id,
                    'name' => $classe->name ?? 'Inconnu',
                    'students' => $classe->students->map(function ($student) {
                        return [
                            'id' => $student->id,
                            'first_name' => $student->first_name,
                            'last_name' => $student->last_name,
                        ];
                    })->toArray(),
                ];
            })->toArray();

            return response()->json([
                'classes' => $classes,
            ]);
        } catch (QueryException $e) {
            \Log::error('TeacherClassesController QueryException: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données'], 500);
        } catch (\Exception $e) {
            \Log::error('TeacherClassesController Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur inattendue'], 500);
        }
    }
}
