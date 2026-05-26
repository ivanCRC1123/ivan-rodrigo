import { useCartStore } from "../../../store/useCartStore";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const isAuth = useAuthStore((s) => s.isAuthenticated)();
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Tu carrito
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            Vaciar
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
          <p className="text-5xl">🛒</p>
          <p className="mt-4 text-lg font-medium text-zinc-400">
            Tu carrito está vacío
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Agregá productos desde el catálogo
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
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
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 shadow-sm transition hover:border-zinc-700/60 sm:p-5"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-semibold text-zinc-100">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-emerald-400">
                    ${Number(item.price).toFixed(2)} c/u
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800/50 text-sm font-semibold text-zinc-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="w-24 text-right">
                  <p className="font-semibold text-zinc-100">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-lg text-zinc-400">Total</span>
              <span className="text-3xl font-bold text-emerald-400">
                ${total.toFixed(2)}
              </span>
            </div>
            {isAuth ? (
              <Link
                to="/checkout"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
              >
                Ir al checkout
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
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ) : (
              <Link
                to="/login"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 px-6 py-3.5 text-base font-bold text-zinc-400 transition hover:bg-zinc-700 active:scale-[0.98]"
              >
                Iniciá sesión para comprar
                <svg
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
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
