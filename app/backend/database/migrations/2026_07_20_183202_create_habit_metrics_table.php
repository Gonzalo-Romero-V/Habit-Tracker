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
        Schema::create('habit_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habit_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('metric_type', ['count', 'duration', 'currency']);
            $table->string('unit')->nullable();
            $table->string('currency_code', 3)->nullable();
            $table->timestamps();

            $table->index('habit_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habit_metrics');
    }
};
