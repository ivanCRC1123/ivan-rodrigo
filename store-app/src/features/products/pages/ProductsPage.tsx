import { useState, useRef } from "react";
import { useProducts } from "../hooks/useProducts";
import { useCartStore } from "../../../store/useCartStore";
import { Link } from "react-router-dom";

function ProductImage({ url, alt }: { url?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || url === "string" || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900/20 to-zinc-800/40">
        <span className="text-5xl">SinIMG</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/*círculo con ícono para cada categoría */
const CATEGORY_ICONS: Record<string, string> = {};

function CategoryPill({
  name,
  active,
  onClick,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
        active ? "scale-110" : "opacity-60 hover:opacity-100"
      }`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl transition-all duration-200 sm:h-20 sm:w-20 sm:text-3xl ${
          active
            ? "bg-emerald-500/20 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/50"
            : "bg-zinc-800/60 hover:bg-zinc-800 hover:shadow-md"
        }`}
      >
        {CATEGORY_ICONS[name] ?? "🍽️"}
      </span>
      <span
        className={`text-xs font-medium capitalize ${
          active ? "text-emerald-400" : "text-zinc-500"
        }`}
      >
        {name}
      </span>
    </button>
  );
}

/* ProductCard — tarjeta moderna con imagen */
function ProductCard({ product }: { product: any }) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: String(product.id),
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-zinc-900/50"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800/30">
        <ProductImage url={product.imagenes_url?.[0]} alt={product.nombre} />

        {/* Categoria  */}
        {product.categorias?.[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-sm">
            {product.categorias[0].nombre}
          </span>
        )}

        {/* boton */}
        <button
          onClick={handleAdd}
          disabled={added}
          className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold shadow-lg transition-all duration-200 active:scale-90 ${
            added
              ? "bg-emerald-500 text-white"
              : "bg-white/90 text-zinc-900 opacity-0 hover:bg-white group-hover:opacity-100"
          }`}
        >
          {added ? "✓" : "+"}
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

/*ProductsPage — página principal con Hero + Categorías + Grid*/
export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const productsRef = useRef<HTMLDivElement>(null);

  // ── Extraer categorías ────────────────────────
  const allCategories = [
    "All",
    ...new Set(
      products?.flatMap((p) => p.categorias.map((c) => c.nombre)) || [],
    ),
  ];

  // ── Filtrar
  const filtered = products?.filter(
    (p) =>
      (selectedCategory === "All" ||
        p.categorias.some((c) => c.nombre === selectedCategory)) &&
      p.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Loading
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
      </div>
    );
  }

  // ── Error
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-4xl">alert</p>
          <p className="mt-3 text-lg font-medium text-red-400">
            Error al cargar productos
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Verificá que el backend esté corriendo en{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400">
              localhost:8000
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* hero*/}
      <section className="relative overflow-hidden border-b border-zinc-800/50">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-emerald-500/3 blur-3xl" />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:py-24 lg:px-8">
          {/* Left — Texto */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              Delivery en 30 min
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Comida{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                irresistible
              </span>
              <br />
              al instante
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400 lg:mx-0">
              Descubrí los sabores que tenés cerca. Hacé tu pedido y recibilo en
              la puerta de tu casa al toque.
            </p>

            {/* inice */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <button
                onClick={() =>
                  productsRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-[0.97]"
              >
                Ver productos
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
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800/50 active:scale-[0.97]"
              >
                Ver carrito
              </Link>
            </div>
          </div>

          {/*Imagen decorativa */}
          <div className="flex-1 lg:flex lg:justify-end">
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              {/* Glow (lo puedes dejar porque queda bonito) */}
              <div className="absolute inset-4 rounded-full bg-emerald-500/10 blur-2xl" />

              {/* Imagen central*/}
              <img
                src="https://imgs.search.brave.com/3dxIcDhRMzU--S4ZgCbZL9DOlgJPjkc7Q5wQo4Kpz1c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTMv/NDU5LzAyNS9zbWFs/bC9mYXN0LWZvb2Qt/YW5kLWRyaW5rcy1v/bi1hLXRyYW5zcGFy/ZW50LWJhY2tncm91/bmQtZnJlZS1wbmcu/cG5n"
                alt="hamburguesa"
                className="relative w-40 h-40 sm:w-56 sm:h-56 lg:w-9999 lg:h-9999 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">Categorías</h2>
          {products && (
            <span className="text-xs text-zinc-600">
              {products.length} producto(s)
            </span>
          )}
        </div>

        {/* Fila de categorías + buscador */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {allCategories.map((cat) => (
              <CategoryPill
                key={cat}
                name={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section
        ref={productsRef}
        className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"
      >
        {/* Resultados vacíos */}
        {filtered?.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-lg font-medium text-zinc-400">
              Sin resultados
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Probá con otro término o categoría
            </p>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
