import { Link, useParams } from "react-router-dom";
import { useProductById } from "../hooks/useProducts";
import { getApiErrorMessage } from "../../../shared/services/apiError";

// ---------- skeleton ----------
const DetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-4 w-20 rounded bg-zinc-700" />
    <div>
      <div className="h-9 w-72 rounded bg-zinc-700" />
      <div className="mt-2 h-4 w-96 rounded bg-zinc-700" />
    </div>
    <div className="flex gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-56 w-80 flex-none rounded-xl bg-zinc-700"
        />
      ))}
    </div>
    <div className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-4 w-24 rounded bg-zinc-700" />
          <div className="h-4 w-32 rounded bg-zinc-700" />
        </div>
      ))}
    </div>
  </div>
);

const SectionDivider = () => (
  <div className="my-5 border-t border-zinc-800" />
);

export const ProductDetailPage = () => {
  const params = useParams();
  const productId = Number(params.id);

  const { data, isLoading, isError, error } = useProductById(productId);

  if (!productId || Number.isNaN(productId)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-lg font-medium text-gray-300">ID de producto inválido</p>
      </div>
    );
  }

  if (isLoading) return <DetailSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-red-700/50 bg-red-900/20 p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-lg font-semibold text-red-400">Error al cargar el producto</p>
          <p className="mt-1 text-sm text-red-300">{getApiErrorMessage(error)}</p>
        </div>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/30 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Volver a productos
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <p className="text-lg font-medium text-gray-300">Producto no encontrado</p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/30 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6 text-white">
      {/* VOLVER */}
      <Link
        to="/productos"
        className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition w-fit"
      >
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
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </Link>

      {/* TITULO */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-wide">{data.nombre}</h1>
          <p className="mt-1 text-gray-400">
            {data.descripcion || "Sin descripción"}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shrink-0 ${
            data.disponible
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {data.disponible ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Disponible
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              No disponible
            </>
          )}
        </span>
      </div>

      {/* IMAGENES */}
      {data.imagenes_url.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.imagenes_url.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt={`${data.nombre} ${index + 1}`}
              className="h-56 w-80 flex-none rounded-xl border border-zinc-700 object-cover hover:scale-[1.02] transition duration-300"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
                (e.target as HTMLImageElement).classList.add("hidden");
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50">
          <div className="text-center">
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
              className="mx-auto text-gray-600"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Sin imágenes</p>
          </div>
        </div>
      )}

      {/* INFO CARD */}
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold tracking-wide">Información del producto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Precio */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Precio base</p>
              <p className="text-lg font-bold text-emerald-400">${data.precio_base}</p>
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">Stock</p>
              <p className="text-lg font-bold text-white">{data.stock_cantidad} uds</p>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* Categorías */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
            <span>Categorías</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.categorias.length > 0 ? data.categorias.map((c) => (
              <span
                key={c.id}
                className="rounded-lg bg-emerald-500/15 px-3 py-1 text-sm text-emerald-400 border border-emerald-500/20"
              >
                {c.nombre}
              </span>
            )) : (
              <span className="text-sm text-gray-500">Sin categorías</span>
            )}
          </div>
        </div>

        <SectionDivider />

        {/* Ingredientes */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
            <span>Ingredientes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.ingredientes.length > 0 ? data.ingredientes.map((i) => (
              <span
                key={i.id}
                className="rounded-lg bg-purple-500/15 px-3 py-1 text-sm text-purple-400 border border-purple-500/20 flex items-center gap-1.5"
              >
                <span>{i.nombre}</span>
                <span className="text-purple-500/60 text-xs">
                  ({Math.round(i.cantidad)} {i.unidad_medida})
                </span>
                {i.es_alergeno && (
                  <span className="text-[10px] font-semibold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded">
                    alérgeno
                  </span>
                )}
              </span>
            )) : (
              <span className="text-sm text-gray-500">Sin ingredientes</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
