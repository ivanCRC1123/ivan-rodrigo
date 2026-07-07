import { useState, useEffect } from "react";

interface ProductFiltersProps {
  onSearchChange: (value: string) => void;
  categoriaFilter: number | undefined;
  onClearCategoryFilter: () => void;
}

export const ProductFilters = ({
  onSearchChange,
  categoriaFilter,
  onClearCategoryFilter,
}: ProductFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      onSearchChange(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    onSearchChange("");
  };

  return (
    <>
      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Buscar productos por nombre o descripción…"
        />
        {debouncedSearch && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2 py-1 text-xs text-gray-400 hover:bg-zinc-700"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* FILTRO ACTIVO DE CATEGORÍA */}
      {categoriaFilter !== undefined && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          <span>
            Filtrando por categoría ID: <strong>{categoriaFilter}</strong>
          </span>
          <button
            type="button"
            onClick={onClearCategoryFilter}
            className="ml-2 rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-gray-300 hover:bg-zinc-700"
          >
            Limpiar filtro
          </button>
        </div>
      )}
    </>
  );
};
