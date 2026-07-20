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
        Schema::create('habits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Sin FK todavía a propósito: `categories` la crea un workstream
            // paralelo. Se agrega la constraint en una migración de
            // seguimiento una vez mergeados ambos tracks.
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('name');
            $table->enum('tracking_type', ['binary', 'quantifiable']);
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->enum('recurrence_type', ['fixed', 'quota']);
            $table->string('recurrence_rule')->nullable();
            $table->unsignedInteger('current_streak')->default(0);
            $table->unsignedInteger('best_streak')->default(0);
            $table->timestamps();

            $table->index('category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habits');
    }
};
