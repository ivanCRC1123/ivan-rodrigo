import type { ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple"
  | "orange"
  | "cyan"
  | "default";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  error: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  purple: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  default: "bg-zinc-800 text-gray-300 border-zinc-700",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-rose-400",
  info: "bg-blue-400",
  purple: "bg-violet-400",
  orange: "bg-orange-400",
  cyan: "bg-cyan-400",
  default: "bg-gray-400",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  pill?: boolean;
  /** Show a small dot indicator before text */
  dot?: boolean;
  className?: string;
}

export const Badge = ({
  children,
  variant = "default",
  pill = false,
  dot = false,
  className = "",
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        pill ? "rounded-full" : "rounded-lg"
      } border px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`}
        />
      )}
      {children}
    </span>
  );
};
