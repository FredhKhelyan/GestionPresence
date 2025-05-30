<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Classe;
use App\Models\User;
use App\Models\Presence;

class Student extends Model
{
    protected $fillable = ['class_id', 'user_id', 'first_name', 'last_name', 'matricule'];

    /**
     * Un étudiant appartient à une classe.
     */
    public function classe()
    {
        return $this->belongsTo(Classe::class, 'class_id');
    }
    /**
     * Un étudiant est lié à un utilisateur.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Un étudiant peut avoir plusieurs présences.
     */
    public function presences()
    {
        return $this->hasMany(Presence::class);
    }
}
