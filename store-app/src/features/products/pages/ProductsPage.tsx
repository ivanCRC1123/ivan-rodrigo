import { useState, useRef } from "react";
import { useProducts } from "../hooks/useProducts";
import { Link } from "react-router-dom";
import { Button } from "../../../shared/ui/Button";
import { ProductCard } from "../components/ProductCard";
import { CategoryPill } from "../components/CategoryPill";
import { useWebSocketCatalogo } from "../../../shared/hooks/useWebSocketCatalogo";

/* ─── Skeleton ─── */
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-800/40 bg-zinc-900/20 overflow-hidden">
      <div className="aspect-square bg-zinc-800/40" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-zinc-800/60" />
        <div className="h-5 w-1/3 rounded bg-zinc-800/40" />
      </div>
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="border-b border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8 animate-pulse">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="h-5 w-32 rounded-full bg-zinc-800/60" />
              <div className="h-12 w-full max-w-lg rounded bg-zinc-800/40" />
              <div className="h-12 w-3/4 rounded bg-zinc-800/40" />
              <div className="h-5 w-96 rounded bg-zinc-800/30" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-zinc-800/30" />
            </div>
          </div>
        </div>
      </section>
      {/* Grid skeleton */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ─── Error ─── */
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-red-400">
          Error al cargar productos
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {error.message || "Verificá que el backend esté corriendo"}
        </p>
        <Button
          size="lg"
          variant="dark"
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ search, category }: { search: string; category: string }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800/60 py-20 px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-600"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-medium text-zinc-400">
          {search ? `Sin resultados para "${search}"` : "Sin productos"}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          {search
            ? "Probá con otro término de búsqueda"
            : category !== "All"
              ? "No hay productos en esta categoría"
              : "No hay productos disponibles"}
        </p>
      </div>
    </div>
  );
}

/* ─── Página Principal ─── */
export default function ProductsPage() {
  useWebSocketCatalogo();
  const { data: products, isLoading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const productsRef = useRef<HTMLDivElement>(null);

  // Extraer categorías con sus imágenes
  const categoryMap = useRef(new Map<string, string | undefined>());
  categoryMap.current.clear();
  products?.forEach((p) =>
    p.categorias.forEach((c) => {
      if (!categoryMap.current.has(c.nombre)) {
        categoryMap.current.set(c.nombre, c.imagen_url);
      }
    }),
  );

  const allCategories = [
    { name: "All", imageUrl: undefined as string | undefined },
    ...Array.from(categoryMap.current.entries()).map(([name, imageUrl]) => ({
      name,
      imageUrl,
    })),
  ];

  // Filtrar
  const filtered = products?.filter(
    (p) =>
      p.disponible &&
      (selectedCategory === "All" ||
        p.categorias.some((c) => c.nombre === selectedCategory)) &&
      p.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  // Loading
  if (isLoading) {
    return <ProductsSkeleton />;
  }

  // Error
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/50">
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

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="xl"
                onClick={() =>
                  productsRef.current?.scrollIntoView({ behavior: "smooth" })
                }
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
              </Button>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800/50 active:scale-[0.97]"
              >
                Ver carrito
              </Link>
            </div>
          </div>

          {/* Imagen decorativa */}
          <div className="flex-1 lg:flex lg:justify-end">
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <div className="absolute inset-4 rounded-full bg-emerald-500/10 blur-2xl" />
              <img
                src="https://imgs.search.brave.com/3dxIcDhRMzU--S4ZgCbZL9DOlgJPjkc7Q5wQo4Kpz1c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTMv/NDU5LzAyNS9zbWFs/bC9mYXN0LWZvb2Qt/YW5kLWRyaW5rcy1v/bi1hLXRyYW5zcGFy/ZW50LWJhY2tncm91/bmQtZnJlZS1wbmcu/cG5n"
                alt="hamburguesa"
                className="relative w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">Categorías</h2>
          {products && (
            <span className="text-xs text-zinc-600">
              {products.length} producto(s)
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {allCategories.map((cat) => (
              <CategoryPill
                key={cat.name}
                name={cat.name}
                imageUrl={cat.imageUrl}
                active={selectedCategory === cat.name}
                onClick={() => setSelectedCategory(cat.name)}
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

      {/* Productos */}
      <section
        ref={productsRef}
        className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"
      >
        {filtered?.length === 0 ? (
          <EmptyState search={search} category={selectedCategory} />
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
