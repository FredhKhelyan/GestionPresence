<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    /**
     * Relation avec le modèle Student (un utilisateur peut être un étudiant).
     */
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function classe()
    {
        return $this->belongsToMany(Classe::class, 'class_teacher', 'teacher_id', 'class_id');
    }
}
