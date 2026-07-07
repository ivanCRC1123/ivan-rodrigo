import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCategories } from "../../categories/hooks/useCategories";
import { useIngredients } from "../../ingredients/hooks/useIngredients";
import { useProductMutations, useProducts } from "../hooks/useProducts";
import { AlertError } from "../../../shared/ui/AlertError";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import type { ProductoRead } from "../types/producto.types";
import { useAuthStore } from "../../auth/store/authStore";
import { ProductFilters } from "../components/ProductFilters";
import { ProductTable } from "../components/ProductTable";
import { ProductFormModal } from "../components/ProductFormModal";

const TableSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
    <div className="flex gap-4 border-b border-zinc-700 pb-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-4 flex-1 rounded bg-zinc-700" />
      ))}
    </div>
    {Array.from({ length: 6 }).map((_, row) => (
      <div
        key={row}
        className="flex gap-4 border-b border-zinc-800 py-3 last:border-0"
      >
        <div className="h-16 w-16 rounded-lg bg-zinc-700" />
        {Array.from({ length: 6 }).map((_, col) => (
          <div key={col} className="h-4 flex-1 self-center rounded bg-zinc-700" />
        ))}
      </div>
    ))}
  </div>
);

export const ProductsPage = () => {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole("ADMIN");
  const isStockOrAdmin = hasRole("ADMIN") || hasRole("STOCK");

  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaFilter = searchParams.get("categoria_id")
    ? Number(searchParams.get("categoria_id"))
    : undefined;

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = {};
    if (categoriaFilter) {
      p.categoria_id = categoriaFilter;
      p.limit = 100;
    }
    if (debouncedSearch) {
      p.search = debouncedSearch;
    }
    return Object.keys(p).length > 0 ? p : undefined;
  }, [categoriaFilter, debouncedSearch]);

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts(
    queryParams as
      | {
          min_precio?: number;
          max_precio?: number;
          limit?: number;
          offset?: number;
          categoria_id?: number;
          search?: string;
        }
      | undefined,
  );
  const { data: categories = [] } = useCategories();
  const { data: ingredients = [] } = useIngredients();

  const productMutations = useProductMutations();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductoRead | null>(null);
  const [formError, setFormError] = useState<string>("");
  const [modalRevision, setModalRevision] = useState(0);

  const startCreate = () => {
    setEditing(null);
    setFormError("");
    setModalRevision((r) => r + 1);
    setOpen(true);
  };

  const startEdit = (product: ProductoRead) => {
    setEditing(product);
    setFormError("");
    setModalRevision((r) => r + 1);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    try {
      await productMutations.delete.mutateAsync(id);
    } catch (deleteError) {
      setFormError(getApiErrorMessage(deleteError));
    }
  };

  return (
    <section className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide">Productos</h1>

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

      <ProductFilters
        onSearchChange={setDebouncedSearch}
        categoriaFilter={categoriaFilter}
        onClearCategoryFilter={() => setSearchParams({})}
      />

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
            <p className="font-semibold text-red-400">Error al cargar productos</p>
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
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <div>
            <p className="text-lg font-medium text-gray-300">
              No hay productos aún
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Crea tu primer producto para empezar a vender
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-medium hover:bg-emerald-600 transition"
            >
              + Crear producto
            </button>
          )}
        </div>
      )}

      {/* DATA STATE */}
      {!isLoading && !isError && data.length > 0 && (
        <ProductTable
          products={data}
          isAdmin={isAdmin}
          isStockOrAdmin={isStockOrAdmin}
          onEdit={startEdit}
          onDelete={onDelete}
        />
      )}

      <ProductFormModal
        key={modalRevision}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        editing={editing}
        categories={categories}
        ingredients={ingredients}
      />
    </section>
  );
};
