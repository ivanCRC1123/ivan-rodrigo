import type { ComponentPropsWithoutRef } from "react";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  /** Cuando true, usa el estilo con borde zinc-800/fondo zinc-900 en vez de zinc-700/zinc-800 */
  subtle?: boolean;
}

const BASE =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition placeholder-zinc-600";

const DEFAULT_STYLE =
  "border border-zinc-700 bg-zinc-800 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20";

const SUBTLE_STYLE =
  "border border-zinc-800 bg-zinc-900/60 text-zinc-100 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20";

export function Input({ subtle = false, className = "", ...props }: InputProps) {
  return (
    <input
      className={`${BASE} ${subtle ? SUBTLE_STYLE : DEFAULT_STYLE} ${className}`.trim()}
      {...props}
    />
  );
}
