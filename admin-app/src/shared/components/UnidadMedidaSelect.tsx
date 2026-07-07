import { useUnits } from "../../features/units/hooks/useUnits";

interface UnidadMedidaSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Selector reutilizable de unidades de medida.
 *
 * Consume el endpoint público GET /api/v1/unidades-medida/
 * y muestra un dropdown con nombre + símbolo.
 *
 * Uso:
 * ```tsx
 * <UnidadMedidaSelect value={form.unidad_venta_id} onChange={(id) => ...} />
 * ```
 */
export const UnidadMedidaSelect = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Seleccionar unidad",
}: UnidadMedidaSelectProps) => {
  const { data: units = [], isLoading } = useUnits();

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-400">Unidad de medida</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || isLoading}
        className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <option value="">Cargando unidades...</option>
        ) : (
          <>
            <option value="">{placeholder}</option>
            {units.map((unit) => (
              <option key={unit.id} value={String(unit.id)}>
                {unit.nombre} ({unit.simbolo})
              </option>
            ))}
          </>
        )}
      </select>
    </label>
  );
};
