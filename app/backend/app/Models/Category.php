<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'color',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Nota: la tabla `habits` todavía no existe (otro workstream la crea).
     * Esta relación declara el contrato de dominio (ver domain/category.md)
     * sin depender de que la migración de Habit ya esté aplicada.
     */
    public function habits(): HasMany
    {
        return $this->hasMany(Habit::class);
    }
}
