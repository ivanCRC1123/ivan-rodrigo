import { useState } from "react";
import { useIngredientMutations } from "../hooks/useIngredients";
import { Modal } from "../../../shared/components/Modal";
import { InputField } from "../../../shared/ui/InputField";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import type { IngredienteRead } from "../types/ingrediente.types";

interface IngredientFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: IngredienteRead | null;
}

type IngredientFormState = {
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
  stock_cantidad: number;
};

const emptyForm: IngredientFormState = {
  nombre: "",
  descripcion: "",
  es_alergeno: false,
  stock_cantidad: 0,
};

const toForm = (ingredient: IngredienteRead): IngredientFormState => ({
  nombre: ingredient.nombre,
  descripcion: ingredient.descripcion ?? "",
  es_alergeno: ingredient.es_alergeno,
  stock_cantidad: ingredient.stock_cantidad,
});

export const IngredientFormModal = ({
  open,
  onClose,
  editing,
}: IngredientFormModalProps) => {
  const ingredientMutations = useIngredientMutations();

  const [form, setForm] = useState<IngredientFormState>(
    editing ? toForm(editing) : emptyForm,
  );
  const [formError, setFormError] = useState("");

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
      stock_cantidad: form.stock_cantidad,
    };

    try {
      if (editing) {
        await ingredientMutations.update.mutateAsync({
          id: editing.id,
          payload,
        });
      } else {
        await ingredientMutations.create.mutateAsync(payload);
      }

      onClose();
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar ingrediente" : "Nuevo ingrediente"}
    >
      <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
        <InputField
          value={form.nombre}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, nombre: event.target.value }))
          }
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

        <div className="space-y-1">
          <label className="text-sm text-gray-400">Stock</label>
          <input
            type="number"
            min={0}
            value={form.stock_cantidad}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                stock_cantidad: Math.max(0, Number(event.target.value)),
              }))
            }
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          className="mt-2 rounded-xl bg-emerald-500 py-2 font-semibold hover:bg-emerald-600 transition"
          disabled={
            ingredientMutations.create.isPending ||
            ingredientMutations.update.isPending
          }
        >
          {editing ? "Guardar cambios" : "Crear ingrediente"}
        </button>
      </form>
    </Modal>
  );
};
