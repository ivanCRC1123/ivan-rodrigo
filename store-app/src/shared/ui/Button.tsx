import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50 active:scale-[0.97]",
  danger:
    "border border-red-500/20 text-red-400 hover:bg-red-500/10",
  ghost:
    "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
  dark:
    "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 active:scale-[0.98]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "rounded-lg px-3 py-1.5 text-xs font-medium",
  md: "rounded-xl px-4 py-2 text-sm font-medium",
  lg: "rounded-xl px-6 py-3 text-sm font-semibold",
  xl: "rounded-xl px-8 py-3.5 text-base font-bold",
};

export function Button({
  variant = "primary",
  size = "lg",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 transition-all duration-200 font-bold";
  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <button
      className={`${base} ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
