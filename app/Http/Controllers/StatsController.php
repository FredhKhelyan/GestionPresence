<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Presence;
use App\Models\Classe;

class StatsController extends Controller
{
    public function stats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé : Administrateur uniquement'], 403);
        }

        $total_presences = Presence::where('status', 'present')->count();
        $total_absences = Presence::where('status', 'absent')->count();
        $total = $total_presences + $total_absences;
        $presence_ratio = $total > 0 ? $total_presences / $total : 0;

        $by_room = Classe::withCount([
            'presences as presences' => function ($query) {
                $query->where('status', 'present');
            },
            'presences as absences' => function ($query) {
                $query->where('status', 'absent');
            }
        ])->get()->map(function ($classe) {
            return [
                'room' => $classe->name,
                'presences' => $classe->presences,
                'absences' => $classe->absences,
            ];
        });

        return response()->json([
            'total_presences' => $total_presences,
            'total_absences' => $total_absences,
            'presence_ratio' => $presence_ratio,
            'by_room' => $by_room,
        ]);
    }
}
