<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    protected $fillable = ['name', 'description'];

    /**
     * Une classe peut avoir plusieurs étudiants.
     */
 
    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'class_teacher', 'class_id', 'teacher_id')
            ->where('role', 'enseignant');
    }

    public function presences()
    {
        return $this->hasManyThrough(
            Presence::class,
            Student::class,
            'class_id', // Clé étrangère dans students
            'student_id', // Clé étrangère dans presences
            'id', // Clé primaire dans classes
            'id' // Clé primaire dans students
        );
    }
}
