import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  addProductToCategory,
  removeProductFromCategory,
} from "../services/productoCategoria.api";
import {
  addIngredientToProduct,
  removeIngredientFromProduct,
  type AddIngredientData,
} from "../services/productoIngrediente.api";
import { useProductMutations } from "../hooks/useProducts";
import { Modal } from "../../../shared/components/Modal";
import { ImageUploader } from "../../../shared/components/ImageUploader";
import { InputField } from "../../../shared/ui/InputField";
import { UnidadMedidaSelect } from "../../../shared/components/UnidadMedidaSelect";
import { getApiErrorMessage } from "../../../shared/services/apiError";
import type { ProductoRead } from "../types/producto.types";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  editing: ProductoRead | null;
  categories: { id: number; nombre: string }[];
  ingredients: { id: number; nombre: string }[];
}

type IngredienteConfig = {
  cantidad: string;
  unidad_medida_id: string;
};

type ProductFormState = {
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagenes_url: string;
  stock_cantidad: string;
  disponible: boolean;
  unidad_venta_id: string;
  categoriaIds: number[];
  ingredienteIds: number[];
  /** Config individual por ingrediente seleccionado */
  ingredienteConfigs: Record<number, IngredienteConfig>;
};

const emptyForm: ProductFormState = {
  nombre: "",
  descripcion: "",
  precio_base: "",
  imagenes_url: "",
  stock_cantidad: "0",
  disponible: true,
  unidad_venta_id: "",
  categoriaIds: [],
  ingredienteIds: [],
  ingredienteConfigs: {},
};

const DEFAULT_INGREDIENTE_CONFIG: IngredienteConfig = {
  cantidad: "1",
  unidad_medida_id: "",
};

const toForm = (product: ProductoRead): ProductFormState => ({
  nombre: product.nombre,
  descripcion: product.descripcion ?? "",
  precio_base: String(product.precio_base),
  imagenes_url: product.imagenes_url.join(", "),
  stock_cantidad: String(product.stock_cantidad),
  disponible: product.disponible,
  unidad_venta_id: product.unidad_venta_id ? String(product.unidad_venta_id) : "",
  categoriaIds: product.categorias.map((item) => item.id),
  ingredienteIds: product.ingredientes.map((item) => item.id),
  ingredienteConfigs: Object.fromEntries(
    product.ingredientes.map((item) => [
      item.id,
      { ...DEFAULT_INGREDIENTE_CONFIG },
    ]),
  ),
});

const toggleId = (ids: number[], id: number) => {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
};

/** Alterna un ingrediente: lo agrega con config default o lo quita junto a su config */
const toggleIngrediente = (
  prev: ProductFormState,
  id: number,
): ProductFormState => {
  const isSelected = prev.ingredienteIds.includes(id);
  const newIds = isSelected
    ? prev.ingredienteIds.filter((i) => i !== id)
    : [...prev.ingredienteIds, id];

  const newConfigs = { ...prev.ingredienteConfigs };
  if (isSelected) {
    delete newConfigs[id];
  } else {
    newConfigs[id] = { ...DEFAULT_INGREDIENTE_CONFIG };
  }

  return { ...prev, ingredienteIds: newIds, ingredienteConfigs: newConfigs };
};

export const ProductFormModal = ({
  open,
  onClose,
  editing,
  categories,
  ingredients,
}: ProductFormModalProps) => {
  const queryClient = useQueryClient();
  const productMutations = useProductMutations();

  const [form, setForm] = useState<ProductFormState>(
    editing ? toForm(editing) : emptyForm,
  );
  const [formError, setFormError] = useState<string>("");

  const syncRelations = async (
    productId: number,
    selectedCategoryIds: number[],
    selectedIngredientIds: number[],
    currentProduct?: ProductoRead,
  ) => {
    const currentCategoryIds =
      currentProduct?.categorias.map((item) => item.id) ?? [];
    const currentIngredientIds =
      currentProduct?.ingredientes.map((item) => item.id) ?? [];

    const categoriesToAdd = selectedCategoryIds.filter(
      (id) => !currentCategoryIds.includes(id),
    );
    const categoriesToRemove = currentCategoryIds.filter(
      (id) => !selectedCategoryIds.includes(id),
    );

    const ingredientsToRemoveIds = currentIngredientIds.filter(
      (id) => !selectedIngredientIds.includes(id),
    );

    const addPromises: Promise<void>[] = [];

    for (const ingredienteId of selectedIngredientIds) {
      // Si ya existe, no lo agregamos de nuevo
      if (currentIngredientIds.includes(ingredienteId)) continue;

      const config = form.ingredienteConfigs[ingredienteId];
      const cantidad = config?.cantidad ? Number(config.cantidad) : 1;
      const unidadMedidaId = config?.unidad_medida_id
        ? Number(config.unidad_medida_id)
        : 0;

      const data: AddIngredientData = {
        producto_id: productId,
        ingrediente_id: ingredienteId,
        es_removible: true,
        cantidad: cantidad > 0 ? cantidad : 1,
        unidad_medida_id: unidadMedidaId,
      };
      addPromises.push(addIngredientToProduct(data));
    }

    await Promise.all([
      ...categoriesToAdd.map((categoriaId, index) =>
        addProductToCategory({
          producto_id: productId,
          categoria_id: categoriaId,
          es_principal: index === 0,
        }),
      ),
      ...categoriesToRemove.map((categoriaId) =>
        removeProductFromCategory({
          producto_id: productId,
          categoria_id: categoriaId,
        }),
      ),
      ...addPromises,
      ...ingredientsToRemoveIds.map((ingredienteId) =>
        removeIngredientFromProduct({
          producto_id: productId,
          ingrediente_id: ingredienteId,
        }),
      ),
    ]);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    const precio = Number(form.precio_base);
    const stock = Number(form.stock_cantidad);

    if (Number.isNaN(precio) || precio < 0) {
      setFormError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      setFormError("El stock debe ser un número válido mayor o igual a 0.");
      return;
    }

    const parsedUnidadVenta = form.unidad_venta_id
      ? Number(form.unidad_venta_id)
      : undefined;

    const payload: Record<string, unknown> = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      precio_base: precio,
      imagenes_url: form.imagenes_url
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      stock_cantidad: stock,
      disponible: form.disponible,
      unidad_venta_id: parsedUnidadVenta,
    };

    try {
      let productId = editing?.id;

      if (editing) {
        await productMutations.update.mutateAsync({ id: editing.id, payload });
      } else {
        const createdProduct =
          await productMutations.create.mutateAsync(payload);
        productId = createdProduct.id;
      }

      if (!productId) {
        throw new Error("No se pudo resolver el id del producto.");
      }

      await syncRelations(
        productId,
        form.categoriaIds,
        form.ingredienteIds,
        editing ?? undefined,
      );

      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void queryClient.invalidateQueries({ queryKey: ["products", productId] });

      onClose();
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar producto" : "Nuevo producto"}
    >
      <form className="grid gap-5" onSubmit={(event) => void onSubmit(event)}>
        {/* Nombre */}
        <div className="space-y-1.5">
          <label
            htmlFor="product-nombre"
            className="text-xs font-medium uppercase tracking-wider text-gray-400"
          >
            Nombre <span className="text-rose-400">*</span>
          </label>
          <InputField
            id="product-nombre"
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            placeholder="Ej: Milanesa napolitana"
          />
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label
            htmlFor="product-descripcion"
            className="text-xs font-medium uppercase tracking-wider text-gray-400"
          >
            Descripción
          </label>
          <textarea
            id="product-descripcion"
            value={form.descripcion}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, descripcion: event.target.value }))
            }
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white placeholder-gray-500 transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500"
            placeholder="Descripción opcional del producto"
          />
        </div>

        {/* Precio + Stock (side-by-side) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="product-precio"
              className="text-xs font-medium uppercase tracking-wider text-gray-400"
            >
              Precio base <span className="text-rose-400">*</span>
            </label>
            <InputField
              id="product-precio"
              value={form.precio_base}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, precio_base: event.target.value }))
              }
              placeholder="$ 0.00"
              type="number"
              step="0.01"
              min="0"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="product-stock"
              className="text-xs font-medium uppercase tracking-wider text-gray-400"
            >
              Stock
            </label>
            <InputField
              id="product-stock"
              value={form.stock_cantidad}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  stock_cantidad: event.target.value,
                }))
              }
              placeholder="0"
              type="number"
              min="0"
            />
          </div>
        </div>

        {/* Unidad de venta */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Unidad de venta
          </label>
          <UnidadMedidaSelect
            value={form.unidad_venta_id}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, unidad_venta_id: value }))
            }
            placeholder="Seleccionar unidad de venta"
          />
        </div>

        {/* Imágenes */}
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Imágenes
          </span>

          <ImageUploader
            folder="productos"
            onUpload={(url) =>
              setForm((prev) => ({
                ...prev,
                imagenes_url: prev.imagenes_url
                  ? `${prev.imagenes_url}, ${url}`
                  : url,
              }))
            }
          />

          {/* Lista de imágenes subidas con opción de eliminar */}
          {form.imagenes_url.trim() && (
            <div className="flex flex-wrap gap-2">
              {form.imagenes_url
                .split(",")
                .map((url) => url.trim())
                .filter(Boolean)
                .map((url, idx) => (
                  <div key={idx} className="group relative inline-block">
                    <img
                      src={url}
                      alt={`Imagen ${idx + 1}`}
                      className="h-20 w-20 rounded-lg border border-zinc-700 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const urls = form.imagenes_url
                          .split(",")
                          .map((u) => u.trim())
                          .filter(Boolean);
                        urls.splice(idx, 1);
                        setForm((prev) => ({
                          ...prev,
                          imagenes_url: urls.join(", "),
                        }));
                      }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          )}

          <InputField
            value={form.imagenes_url}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                imagenes_url: event.target.value,
              }))
            }
            placeholder="URL de imagen (o varias separadas por coma)"
          />
        </div>

        {/* Disponible */}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-gray-300 transition hover:border-zinc-700 hover:bg-zinc-900">
          <input
            type="checkbox"
            checked={form.disponible}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                disponible: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-emerald-500"
          />
          <div>
            <span className="font-medium text-gray-200">Disponible</span>
            <p className="text-xs text-gray-500">El producto aparecerá en el catálogo y podrá venderse</p>
          </div>
        </label>

        {/* Categorías */}
        <fieldset className="space-y-2.5 rounded-xl border border-zinc-700/80 bg-zinc-900/30 p-3.5">
          <legend className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Categorías
          </legend>
          <div className="grid max-h-32 gap-1.5 overflow-y-auto text-sm text-gray-300">
            {categories.map((category) => (
              <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-zinc-800/60">
                <input
                  type="checkbox"
                  checked={form.categoriaIds.includes(category.id)}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      categoriaIds: toggleId(prev.categoriaIds, category.id),
                    }))
                  }
                  className="accent-emerald-500"
                />
                {category.nombre}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Ingredientes */}
        <fieldset className="space-y-3 rounded-xl border border-zinc-700/80 bg-zinc-900/30 p-3.5">
          <legend className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Ingredientes
          </legend>

          <div className="grid max-h-36 gap-1.5 overflow-y-auto text-sm text-gray-300">
            {ingredients.map((ingredient) => {
              const isSelected = form.ingredienteIds.includes(ingredient.id);
              return (
                <label key={ingredient.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-zinc-800/60">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      setForm((prev) => toggleIngrediente(prev, ingredient.id))
                    }
                    className="accent-emerald-500"
                  />
                  {ingredient.nombre}
                </label>
              );
            })}
          </div>

          {/* Config individual por ingrediente seleccionado */}
          {form.ingredienteIds.length > 0 && (
            <div className="space-y-3 border-t border-zinc-700/50 pt-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Configuración por ingrediente
              </p>
              {form.ingredienteIds.map((ingId) => {
                const ing = ingredients.find((i) => i.id === ingId);
                const config = form.ingredienteConfigs[ingId];
                if (!ing || !config) return null;

                return (
                  <div
                    key={ingId}
                    className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3"
                  >
                    <p className="mb-2 text-sm font-medium text-gray-200">
                      {ing.nombre}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-wider text-gray-500">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={config.cantidad}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              ingredienteConfigs: {
                                ...prev.ingredienteConfigs,
                                [ingId]: {
                                  ...prev.ingredienteConfigs[ingId],
                                  cantidad: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-wider text-gray-500">
                          Unidad
                        </label>
                        <UnidadMedidaSelect
                          value={config.unidad_medida_id}
                          onChange={(value) =>
                            setForm((prev) => ({
                              ...prev,
                              ingredienteConfigs: {
                                ...prev.ingredienteConfigs,
                                [ingId]: {
                                  ...prev.ingredienteConfigs[ingId],
                                  unidad_medida_id: value,
                                },
                              },
                            }))
                          }
                          placeholder="Seleccionar"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>

        {formError && <p className="text-sm text-red-400">{formError}</p>}

        <button
          type="submit"
          className="rounded-xl bg-emerald-500 py-2 font-semibold hover:bg-emerald-600"
          disabled={
            productMutations.create.isPending ||
            productMutations.update.isPending
          }
        >
          {editing ? "Guardar cambios" : "Crear producto"}
        </button>
      </form>
    </Modal>
  );
};
