import type { DireccionEntregaReadSimple } from "../types";

interface AddressCardProps {
  address: DireccionEntregaReadSimple;
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onSetPrincipal?: () => void;
  showActions?: boolean;
}

export default function AddressCard({
  address,
  selected,
  onSelect,
  onDelete,
  onSetPrincipal,
  showActions = true,
}: AddressCardProps) {
  const addressLine = `${address.calle} ${address.numero}, ${address.localidad}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full rounded-xl border p-4 text-left transition-all ${
        selected
          ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
          : "border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700"
      }`}
    >
      {/* Principal badge */}
      {address.es_principal && (
        <span className="absolute right-3 top-3 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          Principal
        </span>
      )}

      {/* Alias */}
      <p className="pr-20 text-sm font-semibold text-zinc-100">
        {address.alias}
      </p>

      {/* Address line */}
      <p className="mt-1 text-xs text-zinc-500">{addressLine}</p>

      {/* Actions */}
      {showActions && (
        <div className="mt-3 flex items-center gap-3">
          {!address.es_principal && onSetPrincipal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetPrincipal();
              }}
              className="text-[11px] font-medium text-zinc-600 transition hover:text-emerald-400"
            >
              Marcar principal
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[11px] font-medium text-zinc-600 transition hover:text-red-400"
            >
              Eliminar
            </button>
          )}
        </div>
      )}

      {/* Selected indicator */}
      {selected && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}
