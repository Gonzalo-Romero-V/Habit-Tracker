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
        Schema::create('habit_metric_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habit_log_id')->constrained()->cascadeOnDelete();
            $table->foreignId('habit_metric_id')->constrained()->cascadeOnDelete();
            $table->decimal('value', 15, 2);
            $table->timestamps();

            $table->unique(['habit_log_id', 'habit_metric_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habit_metric_logs');
    }
};
