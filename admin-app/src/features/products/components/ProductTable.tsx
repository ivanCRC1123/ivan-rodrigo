import { Link } from "react-router-dom";
import type { ProductoRead } from "../types/producto.types";

interface ProductTableProps {
  products: ProductoRead[];
  isAdmin: boolean;
  isStockOrAdmin: boolean;
  onEdit: (product: ProductoRead) => void;
  onDelete: (id: number) => void;
}

export const ProductTable = ({
  products,
  isAdmin,
  isStockOrAdmin,
  onEdit,
  onDelete,
}: ProductTableProps) => {
  return (
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
          {products.map((product) => {
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
                    <span className="text-xs text-gray-500">Sin imagen</span>
                  )}
                </td>

                <td className="p-3 font-medium">{product.nombre}</td>

                <td className="p-3 text-emerald-400 font-semibold">
                  ${product.precio_base}
                </td>

                <td className="p-3">{product.stock_cantidad}</td>

                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                      product.disponible
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {product.disponible ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Sí
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        No
                      </>
                    )}
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

                    {isStockOrAdmin && (
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="rounded-lg bg-yellow-500/20 px-3 py-1 text-yellow-400 hover:bg-yellow-500/30"
                      >
                        Editar
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => void onDelete(product.id)}
                        className="rounded-lg bg-red-500/20 px-3 py-1 text-red-400 hover:bg-red-500/30"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
