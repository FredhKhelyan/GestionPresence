<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassTeacher extends Model
{
    protected $table = 'class_teacher';
    protected $fillable = ['class_id', 'teacher_id'];

    /**
     * La classe associée.
     */
    public function classe()
    {
        return $this->belongsTo(Classe::class, 'class_id');
    }

    /**
     * L'enseignant associé.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}