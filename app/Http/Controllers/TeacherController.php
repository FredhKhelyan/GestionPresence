<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\Presence;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class TeacherController extends Controller
{
    /**
     * Récupérer le profil de l'enseignant.
     */
    public function getProfile(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->role !== 'enseignant') {
                return response()->json(['error' => 'Non autorisé : Enseignant uniquement'], 403);
            }
            return response()->json([
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]);
        } catch (\Exception $e) {
            \Log::error('TeacherController getProfile Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Récupérer les classes assignées à l'enseignant.
     */
    public function getClasses(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->role !== 'enseignant') {
                return response()->json(['error' => 'Non autorisé : Enseignant uniquement'], 403);
            }

            $classes = $user->classes()->withCount('students')->get();
            return response()->json($classes);
        } catch (QueryException $e) {
            \Log::error('TeacherController getClasses QueryException: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données'], 500);
        } catch (\Exception $e) {
            \Log::error('TeacherController getClasses Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Récupérer les statistiques des présences pour les classes de l'enseignant.
     */
    public function getStats(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user || $user->role !== 'enseignant') {
                return response()->json(['error' => 'Non autorisé : Enseignant uniquement'], 403);
            }

            $classes = $user->classes()->pluck('classes.id'); // Corrigé : classes.id

            if ($classes->isEmpty()) {
                return response()->json([
                    'total' => 0,
                    'present' => 0,
                    'absent' => 0,
                    'presence_rate' => 0,
                    'by_class' => [],
                ]);
            }

            $presences = Presence::whereHas('student', function ($query) use ($classes) {
                $query->whereIn('class_id', $classes)->whereNotNull('class_id');
            })->with(['student' => function ($query) {
                $query->with('classe');
            }])->get();

            $stats = [
                'total' => $presences->count(),
                'present' => $presences->where('status', 'present')->count(),
                'absent' => $presences->where('status', 'absent')->count(),
                'presence_rate' => $presences->count() > 0 ? round(($presences->where('status', 'present')->count() / $presences->count()) * 100, 2) : 0,
                'by_class' => $presences->groupBy('student.class_id')->map(function ($group) {
                    $total = $group->count();
                    $present = $group->where('status', 'present')->count();
                    $classe = $group->first()->student->classe;
                    return [
                        'class_name' => $classe ? $classe->name : 'N/A',
                        'total' => $total,
                        'present' => $present,
                        'absent' => $total - $present,
                        'presence_rate' => $total > 0 ? round(($present / $total) * 100, 2) : 0,
                    ];
                })->values()->toArray(),
            ];

            return response()->json($stats);
        } catch (QueryException $e) {
            \Log::error('TeacherController getStats QueryException: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données'], 500);
        } catch (\Exception $e) {
            \Log::error('TeacherController getStats Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur'], 500);
        }
    }
}
