<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class ClassesController extends Controller
{
    /**
     * Lister toutes les classes.
     */
    public function index()
    {
        try {
            $classes = Classe::all();
            return response()->json($classes);
        } catch (QueryException $e) {
            \Log::error('ClassesController index QueryException: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données'], 500);
        } catch (\Exception $e) {
            \Log::error('ClassesController index Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Récupérer les étudiants d'une classe.
     */
    public function getStudents(Request $request, $id)
    {
        try {
            $classe = Classe::find($id);
            if (!$classe) {
                return response()->json(['error' => 'Classe non trouvée'], 404);
            }

            // Vérifier si l'enseignant est assigné à la classe
            $user = $request->user();
            if ($user->role === 'enseignant' && !$user->classes()->where('classes.id', $id)->exists()) {
                return response()->json(['error' => 'Classe non assignée'], 403);
            }

            $students = $classe->students()->with('user')->get()->map(function ($student) {
                return [
                    'id' => $student->id,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'matricule' => $student->matricule,
                    'email' => $student->user->email ?? null,
                ];
            });

            return response()->json($students);
        } catch (QueryException $e) {
            \Log::error('ClassesController getStudents QueryException: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données'], 500);
        } catch (\Exception $e) {
            \Log::error('ClassesController getStudents Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }
}
