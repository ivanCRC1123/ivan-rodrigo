import { useCartStore } from "../../../store/useCartStore";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../shared/ui/Button";
import { CartItem } from "../components/CartItem";

export default function CartPage() {
  const { items, clearCart } = useCartStore();
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
          <Button variant="danger" size="sm" onClick={clearCart}>
            Vaciar
          </Button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-800/60 py-20 px-8 text-center">
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
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-zinc-400">
              Tu carrito está vacío
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Agregá productos desde el catálogo
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
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
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="mt-8 rounded-2xl border border-zinc-800/60 bg-gradient-to-b from-zinc-900/40 to-zinc-900/20 p-6 shadow-sm">
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
