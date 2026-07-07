import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { CategoriaRead } from "../types/categoria.types";

interface CategoryTableProps {
  categories: CategoriaRead[];
  isAdmin: boolean;
  onEdit: (category: CategoriaRead) => void;
  onDelete: (id: number) => void;
}

/* ---------- helpers ---------- */

function buildTree(items: CategoriaRead[]): CategoriaRead[] {
  const map = new Map<number, CategoriaRead & { _depth?: number }>();
  const roots: (CategoriaRead & { _depth?: number })[] = [];

  // indexar
  for (const cat of items) {
    map.set(cat.id, { ...cat, _depth: 0 });
  }

  // asignar hijos a su padre y marcar profundidad
  for (const cat of items) {
    if (cat.parent_id != null && map.has(cat.parent_id)) {
      const parent = map.get(cat.parent_id)!;
      const child = map.get(cat.id)!;
      child._depth = (parent._depth ?? 0) + 1;
    }
  }

  // construir el flat ordenado: raíces → hijos
  const processed = new Set<number>();

  const visit = (id: number) => {
    if (processed.has(id)) return;
    processed.add(id);
    const node = map.get(id)!;
    roots.push(node);
    // hijos de este nodo
    const children = items
      .filter((c) => c.parent_id === id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    for (const child of children) {
      visit(child.id);
    }
  };

  // raíces ordenadas
  const sortedRoots = items
    .filter((c) => c.parent_id == null)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  for (const root of sortedRoots) {
    visit(root.id);
  }

  // agregar huérfanos (parent_id apunta a categoría que no existe)
  for (const cat of items) {
    if (!processed.has(cat.id)) {
      roots.push({ ...cat, _depth: 0 });
    }
  }

  return roots;
}

/* ---------- componente ---------- */

const INDENT_PX = 24;

export const CategoryTable = ({
  categories,
  isAdmin,
  onEdit,
  onDelete,
}: CategoryTableProps) => {
  const tree = useMemo(() => buildTree(categories), [categories]);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-800 text-gray-300">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Imagen</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {tree.map((category) => {
            const depth = category._depth ?? 0;
            const hasChildren = categories.some(
              (c) => c.parent_id === category.id,
            );

            return (
              <tr
                key={category.id}
                className={`border-t border-zinc-700 hover:bg-zinc-800 transition ${
                  depth > 0 ? "bg-zinc-800/40" : ""
                }`}
              >
                {/* ID */}
                <td className="p-3 text-gray-500 text-xs font-mono align-middle">
                  #{category.id}
                </td>

                {/* Imagen */}
                <td className="p-3 align-middle">
                  {category.imagen_url ? (
                    <img
                      src={category.imagen_url}
                      alt={category.nombre}
                      className={`h-10 w-10 rounded-lg border border-zinc-700 object-cover`}
                      style={{
                        marginLeft: depth * INDENT_PX,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span
                      className="text-xs text-gray-500"
                      style={{ marginLeft: depth * INDENT_PX }}
                    >
                      {depth > 0 ? "└ " : "—"}
                    </span>
                  )}
                </td>

                {/* Nombre */}
                <td className="p-3 font-medium align-middle">
                  <span
                    style={{ marginLeft: depth > 0 ? 0 : undefined }}
                    className={
                      depth > 0
                        ? "text-sm text-gray-300"
                        : "text-base font-semibold"
                    }
                  >
                    {depth > 0 && (
                      <span className="mr-2 text-gray-600 select-none">
                        {hasChildren ? "├" : "└"}
                      </span>
                    )}
                    {category.nombre}
                  </span>
                </td>

                {/* Descripción */}
                <td className="p-3 text-gray-400 align-middle">
                  {category.descripcion || "-"}
                </td>

                {/* Acciones */}
                <td className="p-3 align-middle">
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
                          onClick={() => onEdit(category)}
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
                      <span className="text-xs text-gray-500">
                        Solo lectura
                      </span>
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
