import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** @default "md" */
  padding?: "none" | "sm" | "md" | "lg";
  /** Extra classes */
  className?: string;
  /** Hover effect (subtle lift) */
  hoverable?: boolean;
  /** Accent color bar at the top */
  accent?: "emerald" | "violet" | "blue" | "amber" | "rose" | "cyan" | "none";
}

const paddingStyles: Record<string, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const accentStyles: Record<string, string> = {
  emerald: "before:bg-emerald-500",
  violet: "before:bg-violet-500",
  blue: "before:bg-blue-500",
  amber: "before:bg-amber-500",
  rose: "before:bg-rose-500",
  cyan: "before:bg-cyan-500",
  none: "",
};

export const Card = ({
  children,
  padding = "md",
  className = "",
  hoverable = false,
  accent = "none",
}: CardProps) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/90
        shadow-lg backdrop-blur-sm
        ${paddingStyles[padding]}
        ${accent !== "none" ? `before:absolute before:left-0 before:top-0 before:h-1 before:w-full ${accentStyles[accent]}` : ""}
        ${hoverable ? "transition hover:-translate-y-0.5 hover:shadow-xl hover:border-zinc-700" : ""}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};
