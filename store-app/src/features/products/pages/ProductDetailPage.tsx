import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductDetail } from "../hooks/useProducts";
import { useCartStore } from "../../../store/useCartStore";

function ProductImage({ url, alt }: { url?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || url === "string" || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900/10 to-zinc-800/30">
        <span className="text-7xl">sin img</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProductDetail(id!);
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: String(product.id),
      name: product.nombre,
      price: product.precio_base,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // ── Loading
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
      </div>
    );
  }

  // ── Error
  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-4xl">Error</p>
          <p className="mt-3 text-lg font-medium text-red-400">
            Producto no encontrado
          </p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-600">
        <Link to="/" className="transition hover:text-zinc-300">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-400">{product.nombre}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ── IMAGE ── */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30 shadow-xl">
          <div className="aspect-square">
            <ProductImage
              url={product.imagenes_url?.[0]}
              alt={product.nombre}
            />
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="flex flex-col justify-center">
          {/* Categories */}
          {product.categorias && product.categorias.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {product.categorias.map((c: any) => (
                <span
                  key={c.id}
                  className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                >
                  {c.nombre}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            {product.nombre}
          </h1>

          <p className="mt-4 leading-relaxed text-zinc-400">
            {product.descripcion || "Sin descripción disponible."}
          </p>

          {/* Ingredients */}
          {product.ingredientes && product.ingredientes.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
                Ingredientes
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredientes.map((ing: any) => (
                  <span
                    key={ing.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400"
                  >
                    {ing.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="mt-4">
            {product.stock_cantidad > 0 ? (
              <span className="text-xs text-emerald-500">
                ✓ {product.stock_cantidad} en stock
              </span>
            ) : (
              <span className="text-xs text-red-400">✗ Sin stock</span>
            )}
          </div>

          {/* Price + Add to cart */}
          <div className="mt-8 flex items-center gap-4 border-t border-zinc-800/60 pt-6">
            <div>
              <p className="text-sm text-zinc-500">Precio</p>
              <p className="text-4xl font-bold text-emerald-400">
                ${Number(product.precio_base).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAdd}
              disabled={added || product.stock_cantidad <= 0}
              className={`ml-auto flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/30"
              }`}
            >
              {added ? (
                <>
                  <span>✓</span> Agregado
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
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
                  Agregar al carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
