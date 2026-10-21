<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ThesisStudent extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'student_id_formatted',
        'name_latin',
        'name_khmer',
        'sex',
        'phone',
        'campus_code',
        'campus_name',
        'major_code',
        'major_name',
        'class_code',
        'shift',
        'batch',
        'academic_year',
        'sheet',
        'group_no',
        'supervisor_id',
        'supervisor_name',
        'supervisor_phone',
        'topic_title',
        'topic_raw',
        'topic_questions',
        'score',
        'result_status',
        'is_na',
        'status_remark',
        'signed',
        'signed_at',
        'signature_notes',
        'signed_device_ip',
    ];

    protected $casts = [
        'topic_questions' => 'array',
        'score' => 'float',
        'is_na' => 'boolean',
        'signed' => 'boolean',
        'signed_at' => 'datetime',
        'group_no' => 'integer',
    ];

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ThesisReport::class);
    }
}
