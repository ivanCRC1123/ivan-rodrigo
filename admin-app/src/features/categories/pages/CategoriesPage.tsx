import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal } from "../../../components/ui/Modal";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../../hooks/useCategories";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { CategoriaRead } from "../../../types/CategoriaRead";
import { useAuthStore } from "../../../stores/authStore";
import {
  searchPublicCategories,
  type CategoriaPublicItem,
} from "../../../api/categoria.api";

// ── Helper para construir opciones jerárquicas ─────────────────────

type CategoryOption = { id: number; nombre: string; depth: number };

function buildCategoryOptions(
  categories: CategoriaRead[],
  excludeId?: number,
): CategoryOption[] {
  const result: CategoryOption[] = [];

  // Build adjacency map: parent_id -> children
  const childrenMap = new Map<number | null, CategoriaRead[]>();
  for (const cat of categories) {
    const key = cat.parent_id ?? null;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(cat);
  }

  // DFS traversal to build flat options with depth
  function traverse(parentId: number | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const child of children) {
      if (child.id === excludeId) continue; // skip self-reference
      result.push({ id: child.id, nombre: child.nombre, depth });
      traverse(child.id, depth + 1);
    }
  }

  traverse(null, 0);
  return result;
}

type CategoryFormState = {
  nombre: string;
  descripcion: string;
  imagen_url: string;
  parent_id: string;
};

const emptyForm: CategoryFormState = {
  nombre: "",
  descripcion: "",
  imagen_url: "",
  parent_id: "",
};

const toForm = (category: CategoriaRead): CategoryFormState => ({
  nombre: category.nombre,
  descripcion: category.descripcion ?? "",
  imagen_url: category.imagen_url ?? "",
  parent_id: category.parent_id ? String(category.parent_id) : "",
});

export const CategoriesPage = () => {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole("ADMIN");
  const { data = [], isLoading, isError, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoriaRead | null>(null);

  // Opciones jerárquicas para el selector de categoría padre
  const categoryOptions = useMemo(
    () => buildCategoryOptions(data, editing?.id),
    [data, editing?.id],
  );
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [formError, setFormError] = useState("");

  // ── Search / browse ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CategoriaPublicItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [browseParentId, setBrowseParentId] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchPublicCategories({
          search: searchQuery.trim(),
          limit: 20,
        });
        setSearchResults(res.items);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBrowseSubcategories = async (parentId: number) => {
    setBrowseParentId(parentId);
    setSearchQuery("");
    try {
      const res = await searchPublicCategories({ parent_id: parentId, limit: 50 });
      setSearchResults(res.items);
    } catch {
      setSearchResults([]);
    }
  };

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setOpen(true);
  };

  const startEdit = (category: CategoriaRead) => {
    setEditing(category);
    setForm(toForm(category));
    setFormError("");
    setOpen(true);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setFormError("Espacios en blanco obligatorio");
      return;
    }

    const parsedParentId = Number(form.parent_id);

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      imagen_url: form.imagen_url.trim() || undefined,
      parent_id:
        form.parent_id.trim() === ""
          ? undefined
          : Number.isNaN(parsedParentId)
            ? undefined
            : parsedParentId,
    };

    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, payload });
      } else {
        await createCategory.mutateAsync(payload);
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setFormError("");
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
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

      {/* SEARCH */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setBrowseParentId(undefined);
          }}
          className="flex-1 min-w-[200px] rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Buscar categorías por nombre…"
        />

        {browseParentId && (
          <button
            type="button"
            onClick={() => {
              setBrowseParentId(undefined);
              setSearchResults([]);
              setSearchQuery("");
            }}
            className="rounded-lg bg-zinc-700 px-3 py-2 text-sm text-gray-300 hover:bg-zinc-600 transition"
          >
            Volver a todas
          </button>
        )}
      </div>

      {/* BÚSQUEDA / EXPLORACIÓN — resultados */}
      {searchQuery.trim() || browseParentId ? (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
            {browseParentId
              ? `Subcategorías de ID ${browseParentId}`
              : `Resultados: "${searchQuery}"`}
          </h2>

          {searching && <p className="text-sm text-gray-400">Buscando…</p>}

          {!searching && searchResults.length === 0 && (
            <p className="text-sm text-gray-500">Sin resultados.</p>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-800 p-3"
                >
                  <div>
                    <p className="font-medium text-white">{cat.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {cat.descripcion || "Sin descripción"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/productos?categoria_id=${cat.id}`}
                      className="rounded-md bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/30 transition"
                    >
                      Ver productos
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleBrowseSubcategories(cat.id)}
                      className="rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/30 transition"
                      title="Explorar subcategorías"
                    >
                      Sub
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* ERROR */}
      {formError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {formError}
        </p>
      )}

      {isLoading && <p className="text-gray-400">Cargando categorías...</p>}
      {isError && <p className="text-red-400">{getApiErrorMessage(error)}</p>}

      {/* TABLA */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-800 text-gray-300">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Parent</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data.map((category) => (
                <tr
                  key={category.id}
                  className="border-t border-zinc-700 hover:bg-zinc-800 transition"
                >
                  <td className="p-3 font-medium">{category.nombre}</td>
                  <td className="p-3 text-gray-400">
                    {category.descripcion || "-"}
                  </td>
                  <td className="p-3 text-gray-400">
                    {category.parent_id ?? "-"}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/productos?categoria_id=${category.id}`}
                        className="rounded-lg bg-emerald-500/20 px-3 py-1 text-emerald-400 hover:bg-emerald-500/30 transition text-xs"
                      >
                        Productos
                      </Link>
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(category)}
                            className="rounded-lg bg-yellow-500/20 px-3 py-1 text-yellow-400 hover:bg-yellow-500/30 transition"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => void onDelete(category.id)}
                            className="rounded-lg bg-red-500/20 px-3 py-1 text-red-400 hover:bg-red-500/30 transition"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                      {!isAdmin && (
                        <span className="text-xs text-gray-500">Solo lectura</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar categoría" : "Nueva categoría"}
      >
        <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          <input
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Nombre"
          />

          <textarea
            value={form.descripcion}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, descripcion: event.target.value }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Descripción"
          />

          {/* Selector jerárquico de categoría padre */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">Categoría padre</span>
            <select
              value={form.parent_id}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, parent_id: event.target.value }))
              }
              className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Ninguna (categoría raíz)</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {"\u00A0".repeat(opt.depth * 4)}
                  {opt.depth > 0 ? "\u2514 " : ""}
                  {opt.nombre}
                </option>
              ))}
            </select>
          </label>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            className="mt-2 rounded-xl bg-emerald-500 py-2 font-semibold hover:bg-emerald-600 transition"
            disabled={createCategory.isPending || updateCategory.isPending}
          >
            {editing ? "Guardar cambios" : "Crear categoría"}
          </button>
        </form>
      </Modal>
    </section>
  );
};
