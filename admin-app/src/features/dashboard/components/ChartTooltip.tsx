// Custom tooltip shared by all dashboard charts
export const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/95 px-3 py-2 text-sm shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-medium" style={{ color: entry.color }}>
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? entry.name.toLowerCase().includes("venta") ||
              entry.name.toLowerCase().includes("total")
              ? entry.value.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 0,
                })
              : entry.value.toLocaleString()
            : entry.value}
        </p>
      ))}
    </div>
  );
};
