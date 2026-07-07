import { useState, useMemo } from "react";
import {
  useIngredientMutations,
  useIngredients,
} from "../hooks/useIngredients";
import { AlertError } from "../../../shared/ui/AlertError";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import type { IngredienteRead } from "../types/ingrediente.types";
import { useAuthStore } from "../../auth/store/authStore";
import { IngredientTable } from "../components/IngredientTable";
import { IngredientFormModal } from "../components/IngredientFormModal";

const TableSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
    <div className="flex gap-4 border-b border-zinc-700 pb-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-4 flex-1 rounded bg-zinc-700" />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, row) => (
      <div
        key={row}
        className="flex gap-4 border-b border-zinc-800 py-4 last:border-0"
      >
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="h-4 flex-1 self-center rounded bg-zinc-700" />
        ))}
        <div className="h-8 w-28 self-center rounded-lg bg-zinc-700" />
      </div>
    ))}
  </div>
);

export const IngredientsPage = () => {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole("ADMIN");
  const { data = [], isLoading, isError, error, refetch } = useIngredients();
  const ingredientMutations = useIngredientMutations();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IngredienteRead | null>(null);
  const [formError, setFormError] = useState("");
  const [modalRevision, setModalRevision] = useState(0);
  const [filterAlergeno, setFilterAlergeno] = useState<"todos" | "alergeno" | "no_alergeno">("todos");



  const filteredData = useMemo(() => {
    if (filterAlergeno === "todos") return data;
    return data.filter((ing) =>
      filterAlergeno === "alergeno" ? ing.es_alergeno : !ing.es_alergeno,
    );
  }, [data, filterAlergeno]);

  const startCreate = () => {
    setEditing(null);
    setFormError("");
    setModalRevision((r) => r + 1);
    setOpen(true);
  };

  const startEdit = (ingredient: IngredienteRead) => {
    setEditing(ingredient);
    setFormError("");
    setModalRevision((r) => r + 1);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    try {
      await ingredientMutations.delete.mutateAsync(id);
    } catch (deleteError) {
      setFormError(getApiErrorMessage(deleteError));
    }
  };

  return (
    <section className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide">Ingredientes</h1>

        <div className="flex items-center gap-3">
          {/* Filter: Alérgenos */}
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
            {(["todos", "alergeno", "no_alergeno"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFilterAlergeno(opt)}
                className={`px-3 py-1.5 text-xs font-medium transition ${
                  filterAlergeno === opt
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {opt === "todos"
                  ? "Todos"
                  : opt === "alergeno"
                    ? "⚠ Alérgenos"
                    : "✓ No alérgenos"}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-medium hover:bg-emerald-600 transition shadow-lg"
            >
              + Nuevo
            </button>
          )}
        </div>
      </div>

      <AlertError message={formError} />

      {/* LOADING STATE */}
      {isLoading && <TableSkeleton />}

      {/* ERROR STATE */}
      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-700/50 bg-red-900/20 p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="font-semibold text-red-400">Error al cargar ingredientes</p>
            <p className="mt-1 text-sm text-red-300">
              {getApiErrorMessage(error)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !isError && filteredData.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
          <div>
            <p className="text-lg font-medium text-gray-300">
              No hay ingredientes aún
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Agrega ingredientes para personalizar los productos
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-medium hover:bg-emerald-600 transition"
            >
              + Nuevo ingrediente
            </button>
          )}
        </div>
      )}

      {/* DATA STATE */}
      {!isLoading && !isError && filteredData.length > 0 && (
        <IngredientTable
          ingredients={filteredData}
          isAdmin={isAdmin}
          onEdit={startEdit}
          onDelete={onDelete}

        />
      )}

      <IngredientFormModal
        key={modalRevision}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
    </section>
  );
};
