import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useCategories";
import { getApiErrorMessage } from "../../lib/apiError";
import type { CategoriaRead } from "../../types/CategoriaRead";

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
  const { data = [], isLoading, isError, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoriaRead | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [formError, setFormError] = useState("");

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

        <button
          type="button"
          onClick={startCreate}
          className="rounded-xl bg-emerald-500 px-5 py-2 font-medium hover:bg-emerald-600 transition shadow-lg"
        >
          + Nueva
        </button>
      </div>

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

          {!editing && (
            <input
              value={form.parent_id}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, parent_id: event.target.value }))
              }
              className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Parent ID (opcional)"
              type="number"
              min={1}
            />
          )}

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
