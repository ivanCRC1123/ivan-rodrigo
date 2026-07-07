interface CategoryPillProps {
  name: string;
  imageUrl?: string;
  active: boolean;
  onClick: () => void;
}

export function CategoryPill({ name, imageUrl, active, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
        active ? "" : "opacity-60 hover:opacity-100"
      }`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200 sm:h-20 sm:w-20 ${
          active
            ? "bg-emerald-500/15 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500/50"
            : "bg-zinc-800/60 hover:bg-zinc-800 hover:shadow-md"
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="text-2xl sm:text-3xl">🍽️</span>
        )}
      </span>
      <span
        className={`text-xs font-medium capitalize transition-colors ${
          active ? "text-emerald-400" : "text-zinc-500"
        }`}
      >
        {name}
      </span>
      {/* Indicador de selección */}
      <span
        className={`h-0.5 w-6 rounded-full transition-all duration-200 ${
          active ? "bg-emerald-500 opacity-100" : "bg-transparent opacity-0"
        }`}
      />
    </button>
  );
}
