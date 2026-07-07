interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-10 w-10 border-4",
};

export function Spinner({ size = "lg", label, className = "" }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`.trim()}>
      <div
        className={`animate-spin rounded-full border-zinc-700 border-t-emerald-500 ${SIZE_MAP[size]}`}
      />
      {label && <span className="text-sm text-zinc-500">{label}</span>}
    </div>
  );
}
