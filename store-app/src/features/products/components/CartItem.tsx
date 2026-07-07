import { useCartStore } from "../../../store/useCartStore";

interface CartItemData {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 shadow-sm transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/50 sm:p-5">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="truncate font-semibold text-zinc-100">{item.name}</h3>
        <p className="mt-0.5 text-sm text-emerald-400/80">
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

      {/* eliminar */}
      <button
        onClick={() => removeItem(item.id)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-600 transition-all duration-200 hover:scale-110 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
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
  );
}
