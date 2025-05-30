<?php

// namespace App\Http\Controllers;

// use App\Models\Classe;
// use Illuminate\Http\Request;

// class ClasseController extends Controller
// {
//     /**
//      * Afficher la liste des classes.
//      */
//     public function index(Request $request)
//     {
//         return Classe::withCount('etudiant')->get();
//     }

//     /**
//      * Créer une nouvelle classe (admin uniquement).
//      */
//     public function NewClasse(Request $request)
//     {
//         if ($request->user()->role !== 'admin') {
//             return response()->json(['error' => 'Unauthorized: Admin only'], 403);
//         }

//         $request->validate([
//             'name' => 'required|string|max:255',
//             'description' => 'nullable|string',
//         ]);

//         $class = Classe::create([
//             'name' => $request->name,
//             'description' => $request->description,
//         ]);

//         return response()->json($class, 201);
//     }

//     /**
//      * Afficher une classe spécifique.
//      */
//     public function show(Classe $class)
//     {
//         return $class->loadCount('etudiant');
//     }

//     /**
//      * Mettre à jour une classe (admin uniquement).
//      */
//     public function update(Request $request, Classe $class)
//     {
//         if ($request->user()->role !== 'admin') {
//             return response()->json(['error' => 'Unauthorized: Admin only'], 403);
//         }

//         $request->validate([
//             'name' => 'required|string|max:255',
//             'description' => 'nullable|string',
//         ]);

//         $class->update([
//             'name' => $request->name,
//             'description' => $request->description,
//         ]);

//         return response()->json($class);
//     }

//     /**
//      * Supprimer une classe (admin uniquement).
//      */
//     public function destroy(Request $request, Classe $class)
//     {
//         if ($request->user()->role !== 'admin') {
//             return response()->json(['error' => 'Unauthorized: Admin only'], 403);
//         }

//         $class->delete();
//         return response()->json(null, 204);
//     }
// }
namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    /**
     * Afficher la liste des classes (admin uniquement).
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        return Classe::withCount('students')->get();
    }

    /**
     * Créer une nouvelle classe (admin uniquement).
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $class = Classe::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json($class, 201);
    }

    /**
     * Afficher une classe spécifique (admin uniquement).
     */
    public function show(Request $request, Classe $class)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        return $class->loadCount('students');
    }

    /**
     * Mettre à jour une classe (admin uniquement).
     */
    public function update(Request $request, Classe $class)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $class->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return response()->json($class);
    }

    /**
     * Supprimer une classe (admin uniquement).
     */
    public function destroy(Request $request, Classe $class)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized: Admin only'], 403);
        }

        $class->delete();
        return response()->json(null, 204);
    }
}