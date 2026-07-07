import { useState } from "react";
import { useCategories, useCategoryMutations } from "../hooks/useCategories";
import { AlertError } from "../../../shared/ui/AlertError";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import type { CategoriaRead } from "../types/categoria.types";
import { useAuthStore } from "../../auth/store/authStore";
import { CategorySearch } from "../components/CategorySearch";
import { CategoryTable } from "../components/CategoryTable";
import { CategoryFormModal } from "../components/CategoryFormModal";

const TableSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
    <div className="flex gap-4 border-b border-zinc-700 pb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 flex-1 rounded bg-zinc-700" />
      ))}
    </div>
    {Array.from({ length: 5 }).map((_, row) => (
      <div
        key={row}
        className="flex gap-4 border-b border-zinc-800 py-4 last:border-0"
      >
        <div className="h-12 w-12 rounded-lg bg-zinc-700" />
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="h-4 flex-1 self-center rounded bg-zinc-700" />
        ))}
        <div className="h-8 w-32 self-center rounded-lg bg-zinc-700" />
      </div>
    ))}
  </div>
);

export const CategoriesPage = () => {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole("ADMIN");
  const { data = [], isLoading, isError, error, refetch } = useCategories();
  const categoryMutations = useCategoryMutations();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoriaRead | null>(null);
  const [formError, setFormError] = useState("");
  const [modalRevision, setModalRevision] = useState(0);

  const startCreate = () => {
    setEditing(null);
    setFormError("");
    setModalRevision((r) => r + 1);
    setOpen(true);
  };

  const startEdit = (category: CategoriaRead) => {
    setEditing(category);
    setFormError("");
    setModalRevision((r) => r + 1);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    try {
      await categoryMutations.delete.mutateAsync(id);
    } catch (deleteError) {
      setFormError(getApiErrorMessage(deleteError));
    }
  };

  return (
    <section className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide">Categorías</h1>

        {isAdmin && (
          <button
            type="button"
            onClick={startCreate}
            className="rounded-xl bg-emerald-500 px-5 py-2 font-medium hover:bg-emerald-600 transition shadow-lg"
          >
            + Nueva
          </button>
        )}
      </div>

      <CategorySearch />

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
            <p className="font-semibold text-red-400">Error al cargar categorías</p>
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
      {!isLoading && !isError && data.length === 0 && (
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
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          </svg>
          <div>
            <p className="text-lg font-medium text-gray-300">
              No hay categorías aún
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Crea tu primera categoría para organizar los productos
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-medium hover:bg-emerald-600 transition"
            >
              + Nueva categoría
            </button>
          )}
        </div>
      )}

      {/* DATA STATE */}
      {!isLoading && !isError && data.length > 0 && (
        <CategoryTable
          categories={data}
          isAdmin={isAdmin}
          onEdit={startEdit}
          onDelete={onDelete}
        />
      )}

      <CategoryFormModal
        key={modalRevision}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        editing={editing}
        categories={data}
      />
    </section>
  );
};
