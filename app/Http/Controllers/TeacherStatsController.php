<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class TeacherStatsController extends Controller
{
    public function TeacherStats(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }
            if ($user->role !== 'enseignant') {
                return response()->json(['error' => 'Non autorisé : Enseignant uniquement'], 403);
            }

            // Compter les classes assignées
            $classCount = $user->classes()->count();

            // Compter les étudiants dans les classes
            $studentCount = $user->classes()->with('students')->get()->pluck('students')->flatten()->count();

            // Compter les présences (ex. dernières 30 jours)
            $presenceCount = \App\Models\Presence::whereIn('student_id', function ($query) use ($user) {
                $query->select('id')
                    ->from('students')
                    ->whereIn('class_id', $user->classes()->pluck('classes.id'));
            })
                ->where('date', '>=', now()->subDays(30))
                ->count();

            return response()->json([
                'stats' => [
                    'classes' => $classCount,
                    'students' => $studentCount,
                    'presences' => $presenceCount,
                ],
            ]);
        } catch (QueryException $e) {
            \Log::error('TeacherStatsController QueryException: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données'], 500);
        } catch (\Exception $e) {
            \Log::error('TeacherStatsController Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur serveur: ' . $e->getMessage()], 500);
        }
    }
}