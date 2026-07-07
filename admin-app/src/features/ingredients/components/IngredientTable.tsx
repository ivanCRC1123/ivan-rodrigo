import { useState, useRef, useEffect } from "react";
import { useIngredientMutations } from "../hooks/useIngredients";
import type { IngredienteRead } from "../types/ingrediente.types";

interface IngredientTableProps {
  ingredients: IngredienteRead[];
  isAdmin: boolean;
  onEdit: (ingredient: IngredienteRead) => void;
  onDelete: (id: number) => void;
}

const STOCK_BAJO = 5;

export const IngredientTable = ({
  ingredients,
  isAdmin,
  onEdit,
  onDelete,
}: IngredientTableProps) => {
  const { update } = useIngredientMutations();
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockInput, setStockInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus al abrir input
  useEffect(() => {
    if (editingStockId !== null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingStockId]);

  const startEditing = (ingredient: IngredienteRead) => {
    setEditingStockId(ingredient.id);
    setStockInput(String(ingredient.stock_cantidad));
  };

  const cancelEditing = () => {
    setEditingStockId(null);
    setStockInput("");
  };

  const saveStock = async (id: number) => {
    const newStock = Math.max(0, Number(stockInput));
    if (isNaN(newStock)) return;
    try {
      await update.mutateAsync({ id, payload: { stock_cantidad: newStock } });
    } catch {
      // silent fail — data se revalida del servidor igual
    }
    cancelEditing();
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-800 text-gray-300 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Alérgeno</th>
            <th className="p-3">Stock</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ingredients.map((ingredient) => {
            const stockBajo = ingredient.stock_cantidad <= STOCK_BAJO;
            const isEditing = editingStockId === ingredient.id;

            return (
              <tr
                key={ingredient.id}
                className="border-t border-zinc-700 hover:bg-zinc-800 transition"
              >
                <td className="p-3 text-gray-500 text-xs font-mono">
                  #{ingredient.id}
                </td>

                <td className="p-3 font-medium">{ingredient.nombre}</td>

                <td className="p-3 text-gray-400">
                  {ingredient.descripcion || "-"}
                </td>

                <td className="p-3">
                  {ingredient.es_alergeno ? (
                    <span className="rounded-lg bg-red-500/20 px-2 py-1 text-xs text-red-400">
                      ⚠ Alérgeno
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>

                <td className="p-3">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        ref={inputRef}
                        type="number"
                        min={0}
                        value={stockInput}
                        onChange={(e) => setStockInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void saveStock(ingredient.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                        onBlur={() => void saveStock(ingredient.id)}
                        className="w-20 rounded-md border border-amber-500/50 bg-zinc-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-gray-500">Enter ↵</span>
                    </div>
                  ) : (
                    <span
                      className={`font-mono text-sm cursor-pointer ${
                        stockBajo
                          ? "text-red-400 font-semibold"
                          : "text-gray-300"
                      }`}
                      onClick={() => isAdmin && startEditing(ingredient)}
                      title="Click para editar stock"
                    >
                      {ingredient.stock_cantidad}
                      {stockBajo && (
                        <span className="ml-1.5 text-xs text-red-500">▼ bajo</span>
                      )}
                    </span>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {isAdmin ? (
                      <>
                        {stockBajo && !isEditing && (
                          <button
                            type="button"
                            onClick={() => startEditing(ingredient)}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/25"
                          >
                            ⬆ Reponer stock
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onEdit(ingredient)}
                          className="rounded-lg bg-yellow-500/20 px-3 py-1 text-yellow-400 hover:bg-yellow-500/30 transition"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void onDelete(ingredient.id)}
                          className="rounded-lg bg-red-500/20 px-3 py-1 text-red-400 hover:bg-red-500/30 transition"
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">Solo lectura</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
