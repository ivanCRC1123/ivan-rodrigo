import { useState, useMemo } from "react";
import { useCategoryMutations } from "../hooks/useCategories";
import { Modal } from "../../../shared/components/Modal";
import { ImageUploader } from "../../../shared/components/ImageUploader";
import { InputField } from "../../../shared/ui/InputField";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import type { CategoriaRead } from "../types/categoria.types";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: CategoriaRead | null;
  categories: CategoriaRead[];
}

type CategoryOption = { id: number; nombre: string; depth: number };

function buildCategoryOptions(
  categories: CategoriaRead[],
  excludeId?: number,
): CategoryOption[] {
  const result: CategoryOption[] = [];

  const childrenMap = new Map<number | null, CategoriaRead[]>();
  for (const cat of categories) {
    const key = cat.parent_id ?? null;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(cat);
  }

  function traverse(parentId: number | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const child of children) {
      if (child.id === excludeId) continue;
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

export const CategoryFormModal = ({
  open,
  onClose,
  editing,
  categories,
}: CategoryFormModalProps) => {
  const categoryMutations = useCategoryMutations();

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories, editing?.id),
    [categories, editing?.id],
  );

  const [form, setForm] = useState<CategoryFormState>(
    editing ? toForm(editing) : emptyForm,
  );
  const [formError, setFormError] = useState("");

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
        await categoryMutations.update.mutateAsync({
          id: editing.id,
          payload,
        });
      } else {
        await categoryMutations.create.mutateAsync(payload);
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
      title={editing ? "Editar categoría" : "Nueva categoría"}
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

        <ImageUploader
          folder="categorias"
          onUpload={(url) =>
            setForm((prev) => ({ ...prev, imagen_url: url }))
          }
        />

        {/* Preview de imagen actual con opción de eliminar */}
        {form.imagen_url.trim() && (
          <div className="group relative inline-block">
            <img
              src={form.imagen_url}
              alt="Imagen de categoría"
              className="h-20 w-20 rounded-lg border border-zinc-700 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, imagen_url: "" }))
              }
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
              title="Eliminar imagen"
            >
              ✕
            </button>
          </div>
        )}

        <InputField
          value={form.imagen_url}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, imagen_url: event.target.value }))
          }
          placeholder="URL de imagen (o sube una arriba)"
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
          disabled={
            categoryMutations.create.isPending ||
            categoryMutations.update.isPending
          }
        >
          {editing ? "Guardar cambios" : "Crear categoría"}
        </button>
      </form>
    </Modal>
  );
};
