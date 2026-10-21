<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('thesis_students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id', 20)->index();
            $table->string('student_id_formatted', 20)->nullable();
            $table->string('name_latin')->index();
            $table->string('name_khmer')->nullable();
            $table->string('sex', 10)->default('M');
            $table->string('phone')->nullable();
            $table->string('campus_code', 10)->index(); // UC1 or UC2
            $table->string('campus_name');
            $table->string('major_code', 20)->index(); // SE, CNCS, CMD
            $table->string('major_name');
            $table->string('class_code', 30)->index(); // SE-E1, SE-E2, SE-E3, SE-Mor1, etc.
            $table->string('shift', 30)->default('Evening'); // Evening, Morning, Afternoon, Weekend
            $table->string('batch', 30)->default('Batch VI');
            $table->string('academic_year', 30)->default('2023-2024');
            $table->string('sheet', 30)->nullable()->index();
            $table->integer('group_no')->nullable()->index();
            $table->foreignId('supervisor_id')->nullable()->constrained('supervisors')->nullOnDelete();
            $table->string('supervisor_name')->nullable()->index();
            $table->string('supervisor_phone')->nullable();
            $table->text('topic_title')->nullable();
            $table->text('topic_raw')->nullable();
            $table->json('topic_questions')->nullable();
            $table->decimal('score', 5, 2)->nullable()->index();
            $table->string('result_status', 20)->default('PENDING')->index(); // PASS, FAIL, REPEAT, SUSPEND, STOP, PENDING
            $table->boolean('is_na')->default(false);
            $table->string('status_remark')->nullable();
            $table->boolean('signed')->default(false)->index();
            $table->timestamp('signed_at')->nullable();
            $table->text('signature_notes')->nullable();
            $table->string('signed_device_ip')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thesis_students');
    }
};
