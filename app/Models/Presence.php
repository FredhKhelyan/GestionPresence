<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presence extends Model
{
    protected $fillable = ['student_id', 'date', 'status'];

    /**
     * Une présence est liée à un étudiant.
     */
    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
