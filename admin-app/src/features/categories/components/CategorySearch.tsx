import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  searchPublicCategories,
  type CategoriaPublicItem,
} from "../services/categoria";

export const CategorySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CategoriaPublicItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [browseParentId, setBrowseParentId] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchPublicCategories({
          search: trimmed,
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
      const res = await searchPublicCategories({
        parent_id: parentId,
        limit: 50,
      });
      setSearchResults(res.items);
    } catch {
      setSearchResults([]);
    }
  };

  return (
    <>
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
    </>
  );
};
