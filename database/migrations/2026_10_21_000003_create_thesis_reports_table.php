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
        Schema::create('thesis_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thesis_student_id')->constrained('thesis_students')->cascadeOnDelete();
            $table->string('student_id_code', 20)->index();
            $table->string('student_name');
            $table->string('issue_type', 40)->index(); // wrong_topic, wrong_questions, wrong_supervisor, name_id_error, score_error, signature_issue, other
            $table->text('description');
            $table->string('contact_phone')->nullable();
            $table->string('status', 20)->default('pending')->index(); // pending, under_review, resolved, dismissed
            $table->text('admin_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->string('submitter_ip')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('thesis_reports');
    }
};
