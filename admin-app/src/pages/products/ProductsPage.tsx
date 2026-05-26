import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  addProductToCategory,
  removeProductFromCategory,
} from "../../api/productoCategoria.api";
import {
  addIngredientToProduct,
  removeIngredientFromProduct,
} from "../../api/productoIngrediente.api";
import { Modal } from "../../components/ui/Modal";
import { useCategories } from "../../hooks/useCategories";
import { useIngredients } from "../../hooks/useIngredients";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../../hooks/useProducts";
import { getApiErrorMessage } from "../../lib/apiError";
import type { ProductoRead } from "../../types/ProductoRead";

type ProductFormState = {
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagenes_url: string;
  stock_cantidad: string;
  disponible: boolean;
  categoriaIds: number[];
  ingredienteIds: number[];
};

const emptyForm: ProductFormState = {
  nombre: "",
  descripcion: "",
  precio_base: "",
  imagenes_url: "",
  stock_cantidad: "0",
  disponible: true,
  categoriaIds: [],
  ingredienteIds: [],
};

const toForm = (product: ProductoRead): ProductFormState => ({
  nombre: product.nombre,
  descripcion: product.descripcion ?? "",
  precio_base: String(product.precio_base),
  imagenes_url: product.imagenes_url.join(", "),
  stock_cantidad: String(product.stock_cantidad),
  disponible: product.disponible,
  categoriaIds: product.categorias.map((item) => item.id),
  ingredienteIds: product.ingredientes.map((item) => item.id),
});

const toggleId = (ids: number[], id: number) => {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
};

export const ProductsPage = () => {
  const queryClient = useQueryClient();

  const { data = [], isLoading, isError, error } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: ingredients = [] } = useIngredients();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductoRead | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formError, setFormError] = useState<string>("");

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setOpen(true);
  };

  const startEdit = (product: ProductoRead) => {
    setEditing(product);
    setForm(toForm(product));
    setFormError("");
    setOpen(true);
  };

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

    const ingredientsToAdd = selectedIngredientIds.filter(
      (id) => !currentIngredientIds.includes(id),
    );
    const ingredientsToRemove = currentIngredientIds.filter(
      (id) => !selectedIngredientIds.includes(id),
    );

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
      ...ingredientsToAdd.map((ingredienteId) =>
        addIngredientToProduct({
          producto_id: productId,
          ingrediente_id: ingredienteId,
          es_removible: true,
        }),
      ),
      ...ingredientsToRemove.map((ingredienteId) =>
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

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      precio_base: precio,
      imagenes_url: form.imagenes_url
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      stock_cantidad: stock,
      disponible: form.disponible,
    };

    try {
      let productId = editing?.id;

      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, payload });
      } else {
        const createdProduct = await createProduct.mutateAsync(payload);
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
      await deleteProduct.mutateAsync(id);
    } catch (deleteError) {
      setFormError(getApiErrorMessage(deleteError));
    }
  };

  return (
    <section className="space-y-6 text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>

        <button
          type="button"
          onClick={startCreate}
          className="rounded-xl bg-emerald-500 px-5 py-2 font-medium hover:bg-emerald-600 transition shadow-lg"
        >
          + Nuevo
        </button>
      </div>

      {/* ERROR */}
      {formError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {formError}
        </p>
      )}

      {isLoading && <p className="text-gray-400">Cargando productos...</p>}
      {isError && (
        <p className="text-red-400">Error: {getApiErrorMessage(error)}</p>
      )}

      {/* TABLA */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-800 text-gray-300 text-left">
              <tr>
                <th className="p-3">Imagen</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Disponible</th>
                <th className="p-3">Categorías</th>
                <th className="p-3">Ingredientes</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data.map((product) => {
                const coverImage = product.imagenes_url[0];

                return (
                  <tr
                    key={product.id}
                    className="border-t border-zinc-700 hover:bg-zinc-800 transition"
                  >
                    <td className="p-3">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={product.nombre}
                          className="h-20 w-20 rounded-lg border border-zinc-700 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-gray-500">
                          Sin imagen
                        </span>
                      )}
                    </td>

                    <td className="p-3 font-medium">{product.nombre}</td>

                    <td className="p-3 text-emerald-400 font-semibold">
                      ${product.precio_base}
                    </td>

                    <td className="p-3">{product.stock_cantidad}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs ${
                          product.disponible
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {product.disponible ? "Sí" : "No"}
                      </span>
                    </td>

                    <td className="p-3 text-gray-400 text-xs">
                      {product.categorias.length
                        ? product.categorias.map((c) => c.nombre).join(", ")
                        : "-"}
                    </td>

                    <td className="p-3 text-gray-400 text-xs">
                      {product.ingredientes.length
                        ? product.ingredientes.map((i) => i.nombre).join(", ")
                        : "-"}
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Link
                          to={`/productos/${product.id}`}
                          className="rounded-lg bg-blue-500/20 px-3 py-1 text-blue-400 hover:bg-blue-500/30"
                        >
                          Ver
                        </Link>

                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="rounded-lg bg-yellow-500/20 px-3 py-1 text-yellow-400 hover:bg-yellow-500/30"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void onDelete(product.id)}
                          className="rounded-lg bg-red-500/20 px-3 py-1 text-red-400 hover:bg-red-500/30"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar producto" : "Nuevo producto"}
      >
        <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          <input
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:ring-2 focus:ring-emerald-500"
            placeholder="Nombre"
          />

          <textarea
            value={form.descripcion}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, descripcion: event.target.value }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:ring-2 focus:ring-emerald-500"
            placeholder="Descripción"
          />

          <input
            value={form.precio_base}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, precio_base: event.target.value }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3"
            placeholder="Precio"
            type="number"
          />

          <input
            value={form.stock_cantidad}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                stock_cantidad: event.target.value,
              }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3"
            placeholder="Stock"
            type="number"
          />

          <input
            value={form.imagenes_url}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, imagenes_url: event.target.value }))
            }
            className="rounded-lg bg-zinc-800 border border-zinc-700 p-3"
            placeholder="URLs de imagen"
          />

          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  disponible: event.target.checked,
                }))
              }
              className="accent-emerald-500"
            />
            Disponible
          </label>

          {/* SCROLL CHECKBOXES MÁS LIMPIO */}
          <fieldset className="space-y-2 rounded-xl border border-zinc-700 p-3">
            <legend className="text-sm text-gray-400">Categorías</legend>
            <div className="grid max-h-32 gap-1 overflow-y-auto text-sm text-gray-300">
              {categories.map((category) => (
                <label key={category.id} className="flex gap-2">
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

          <fieldset className="space-y-2 rounded-xl border border-zinc-700 p-3">
            <legend className="text-sm text-gray-400">Ingredientes</legend>
            <div className="grid max-h-32 gap-1 overflow-y-auto text-sm text-gray-300">
              {ingredients.map((ingredient) => (
                <label key={ingredient.id} className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={form.ingredienteIds.includes(ingredient.id)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        ingredienteIds: toggleId(
                          prev.ingredienteIds,
                          ingredient.id,
                        ),
                      }))
                    }
                    className="accent-emerald-500"
                  />
                  {ingredient.nombre}
                </label>
              ))}
            </div>
          </fieldset>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            className="rounded-xl bg-emerald-500 py-2 font-semibold hover:bg-emerald-600"
            disabled={createProduct.isPending || updateProduct.isPending}
          >
            {editing ? "Guardar cambios" : "Crear producto"}
          </button>
        </form>
      </Modal>
    </section>
  );
};
