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
        Schema::create('habit_metric_target_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habit_metric_id')->constrained()->cascadeOnDelete();
            $table->decimal('target_value', 15, 2);
            $table->date('effective_from');
            $table->timestamps();

            $table->index(['habit_metric_id', 'effective_from']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habit_metric_target_versions');
    }
};
