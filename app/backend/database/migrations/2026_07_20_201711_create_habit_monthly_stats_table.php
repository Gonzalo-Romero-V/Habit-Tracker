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
        Schema::create('habit_monthly_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habit_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->unsignedInteger('completed_count')->default(0);
            $table->unsignedInteger('missed_count')->default(0);
            // Meta vigente durante ese mes — evita recalcular desde el
            // historial de versiones cada vez que se dibuja la gráfica
            // escalonada (ver domain/habit.md y domain/habit-metric.md).
            $table->string('recurrence_rule_snapshot')->nullable();
            $table->unsignedInteger('quota_target_snapshot')->nullable();
            $table->string('quota_period_snapshot')->nullable();
            $table->timestamps();

            $table->unique(['habit_id', 'year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habit_monthly_stats');
    }
};
