import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import {
  useCreateIngredient,
  useDeleteIngredient,
  useIngredients,
  useUpdateIngredient,
} from "../../../hooks/useIngredients";
import { getApiErrorMessage } from "../../../lib/apiError";
import type { IngredienteRead } from "../../../types/IngredienteRead";
import { useAuthStore } from "../../../stores/authStore";

type IngredientFormState = {
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
};

const emptyForm: IngredientFormState = {
  nombre: "",
  descripcion: "",
  es_alergeno: false,
};

const toForm = (ingredient: IngredienteRead): IngredientFormState => ({
  nombre: ingredient.nombre,
  descripcion: ingredient.descripcion ?? "",
  es_alergeno: ingredient.es_alergeno,
});

export const IngredientsPage = () => {
  const { hasRole } = useAuthStore();
  const isAdmin = hasRole("ADMIN");
  const { data = [], isLoading, isError, error } = useIngredients();
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IngredienteRead | null>(null);
  const [form, setForm] = useState<IngredientFormState>(emptyForm);
  const [formError, setFormError] = useState("");

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setOpen(true);
  };

  const startEdit = (ingredient: IngredienteRead) => {
    setEditing(ingredient);
    setForm(toForm(ingredient));
    setFormError("");
    setOpen(true);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      es_alergeno: form.es_alergeno,
    };

    try {
      if (editing) {
        await updateIngredient.mutateAsync({ id: editing.id, payload });
      } else {
        await createIngredient.mutateAsync(payload);
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
      await deleteIngredient.mutateAsync(id);
    } catch (deleteError) {
      setFormError(getApiErrorMessage(deleteError));
    }
  };

  return (
    <section className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide">Ingredientes</h1>

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

      {/* ERROR */}
      {formError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {formError}
        </p>
      )}

      {isLoading && <p className="text-gray-400">Cargando ingredientes...</p>}
      {isError && <p className="text-red-400">{getApiErrorMessage(error)}</p>}

      {/* TABLA */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-800 text-gray-300 text-left">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Alérgeno</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data.map((ingredient) => (
                <tr
                  key={ingredient.id}
                  className="border-t border-zinc-700 hover:bg-zinc-800 transition"
                >
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
                    <div className="flex justify-end gap-2">
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(ingredient)}
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
        title={editing ? "Editar ingrediente" : "Nuevo ingrediente"}
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

          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.es_alergeno}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  es_alergeno: event.target.checked,
                }))
              }
              className="accent-red-500"
            />
            Es alérgeno
          </label>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            className="mt-2 rounded-xl bg-emerald-500 py-2 font-semibold hover:bg-emerald-600 transition"
            disabled={createIngredient.isPending || updateIngredient.isPending}
          >
            {editing ? "Guardar cambios" : "Crear ingrediente"}
          </button>
        </form>
      </Modal>
    </section>
  );
};
