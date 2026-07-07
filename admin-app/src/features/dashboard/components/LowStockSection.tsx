interface ProductoStock {
  id: number;
  nombre: string;
  stock_cantidad: number;
  precio_base?: number;
}

interface LowStockSectionProps {
  productos: ProductoStock[];
}

export const LowStockSection = ({ productos }: LowStockSectionProps) => {
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-3 text-gray-600"
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-sm text-gray-500">Stock saludable</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {productos.slice(0, 6).map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 transition hover:bg-zinc-800/40"
        >
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {p.nombre}
            </p>
            {p.precio_base !== undefined && (
              <p className="text-xs text-gray-500">
                ${p.precio_base.toLocaleString()}
              </p>
            )}
          </div>
          <div className="ml-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {/* Mini stock bar */}
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    p.stock_cantidad <= 2
                      ? "bg-rose-500"
                      : p.stock_cantidad <= 3
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min((p.stock_cantidad / 5) * 100, 100)}%`,
                  }}
                />
              </div>
              <span
                className={`text-xs font-semibold ${
                  p.stock_cantidad <= 2
                    ? "text-rose-400"
                    : p.stock_cantidad <= 3
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {p.stock_cantidad}
              </span>
            </div>
          </div>
        </div>
      ))}
      {productos.length > 6 && (
        <p className="pt-1 text-center text-xs text-gray-500">
          +{productos.length - 6} productos más con stock bajo
        </p>
      )}
    </div>
  );
};
