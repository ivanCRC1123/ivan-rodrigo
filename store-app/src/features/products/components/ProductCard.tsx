import { useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../store/useCartStore";
import { ProductImage } from "../../../shared/ui/ProductImage";
import type { ProductoRead } from "../types";

interface ProductCardProps {
  product: ProductoRead;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.nombre,
      price: product.precio_base,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-zinc-900/60"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-zinc-800/30">
        <ProductImage
          url={product.imagenes_url?.[0]}
          alt={product.nombre}
          imgClassName="transition duration-500 group-hover:scale-105"
        />

        {/* Categoria */}
        {product.categorias?.[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur-sm">
            {product.categorias[0].nombre}
          </span>
        )}

        {/* Badge de no disponible */}
        {!product.disponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <span className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-bold text-white shadow-lg">
              No disponible
            </span>
          </div>
        )}

        {/* Botón add — siempre visible pero más sutil sin hover */}
        <button
          onClick={handleAdd}
          disabled={added || !product.disponible}
          className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold shadow-lg transition-all duration-200 active:scale-90 ${
            !product.disponible
              ? "bg-zinc-700/60 text-zinc-500 cursor-not-allowed"
              : added
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-white/80 text-zinc-900 opacity-70 hover:opacity-100 hover:bg-white group-hover:opacity-100 group-hover:shadow-emerald-500/20"
          }`}
        >
          {added ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-1.5 p-4">
        <h3 className="text-[15px] font-semibold leading-tight text-zinc-100 transition group-hover:text-emerald-400">
          {product.nombre}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-400">
            ${Number(product.precio_base).toFixed(2)}
          </span>
          {product.ingredientes?.[0] && (
            <span className="text-[11px] text-zinc-600">
              {product.ingredientes.length} ingrediente(s)
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
