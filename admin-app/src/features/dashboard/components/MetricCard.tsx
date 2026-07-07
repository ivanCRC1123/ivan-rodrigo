import type { ReactNode } from "react";

interface TrendData {
  value: number;
  direction: "up" | "down";
  label?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: TrendData;
  /** Accent color for the left bar */
  accent?: "emerald" | "violet" | "blue" | "amber" | "rose" | "cyan";
  /** Format the value (e.g. currency) */
  formatter?: (val: string | number) => string;
  className?: string;
}

const accentBgMap: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-400",
  violet: "bg-violet-500/15 text-violet-400",
  blue: "bg-blue-500/15 text-blue-400",
  amber: "bg-amber-500/15 text-amber-400",
  rose: "bg-rose-500/15 text-rose-400",
  cyan: "bg-cyan-500/15 text-cyan-400",
};

const accentCardBar: Record<string, string> = {
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
};

export const MetricCard = ({
  title,
  value,
  icon,
  trend,
  accent = "emerald",
  className = "",
}: MetricCardProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-lg backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:border-zinc-700 ${className}`}
    >
      {/* Accent bar at top */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${accentCardBar[accent]}`}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentBgMap[accent]}`}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend.direction === "up" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-400"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-rose-400"
            >
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          <span
            className={`font-semibold ${
              trend.direction === "up" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trend.direction === "up" ? "+" : ""}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-gray-500">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
};
