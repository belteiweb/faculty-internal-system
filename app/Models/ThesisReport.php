<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThesisReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'thesis_student_id',
        'student_id_code',
        'student_name',
        'issue_type',
        'description',
        'contact_phone',
        'status',
        'admin_notes',
        'resolved_at',
        'submitter_ip',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(ThesisStudent::class, 'thesis_student_id');
    }
}
