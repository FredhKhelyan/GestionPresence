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
        return $this->hasMany(Student::class);
    }

    /**
     * Un enseignant peut enseigner plusieurs classes.
     */
    public function teachers()
    {
        return $this->belongsToMany(User::class, 'class_teacher', 'class_id', 'teacher_id')
            ->where('role', 'teacher');
    }

}