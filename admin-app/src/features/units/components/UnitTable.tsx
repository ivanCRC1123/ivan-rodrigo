import type { UnidadMedidaRead } from "../types/unit.types";

interface UnitTableProps {
  units: UnidadMedidaRead[];
  isAdmin: boolean;
  onEdit: (unit: UnidadMedidaRead) => void;
  onDelete: (id: number) => void;
}

const tipoLabels: Record<string, string> = {
  peso: "Peso",
  volumen: "Volumen",
  contable: "Contable",
};

export const UnitTable = ({
  units,
  isAdmin,
  onEdit,
  onDelete,
}: UnitTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-800 text-gray-300 text-left">
          <tr>
            <th className="p-3">Nombre</th>
            <th className="p-3">Símbolo</th>
            <th className="p-3">Tipo</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {units.map((unit) => (
            <tr
              key={unit.id}
              className="border-t border-zinc-700 hover:bg-zinc-800 transition"
            >
              <td className="p-3 font-medium">{unit.nombre}</td>
              <td className="p-3">
                <code className="rounded-md bg-zinc-700/50 px-2 py-0.5 text-emerald-400 font-mono">
                  {unit.simbolo}
                </code>
              </td>
              <td className="p-3">
                <span className="rounded-md bg-zinc-700/50 px-2 py-0.5 text-xs text-gray-300">
                  {tipoLabels[unit.tipo] ?? unit.tipo}
                </span>
              </td>

              <td className="p-3">
                <div className="flex justify-end gap-2">
                  {isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(unit)}
                        className="rounded-lg bg-yellow-500/20 px-3 py-1 text-yellow-400 hover:bg-yellow-500/30 transition"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => void onDelete(unit.id)}
                        className="rounded-lg bg-red-500/20 px-3 py-1 text-red-400 hover:bg-red-500/30 transition"
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">Solo lectura</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
