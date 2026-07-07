import { Badge } from "../../../shared/ui/Badge";

interface PedidoSimple {
  id: number;
  numero_pedido: string;
  estado: string;
  monto_total: number;
  created_at: string;
}

interface RecentOrdersTableProps {
  pedidos: PedidoSimple[];
}

const estadoBadgeVariant: Record<string, "warning" | "info" | "purple" | "success" | "error"> = {
  PENDIENTE: "warning",
  CONFIRMADO: "info",
  EN_PREPARACION: "purple",
  ENTREGADO: "success",
  CANCELADO: "error",
};

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En Preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const RecentOrdersTable = ({ pedidos }: RecentOrdersTableProps) => {
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-3 text-gray-600"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <p className="text-sm text-gray-500">No hay pedidos recientes</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="pb-2 pr-4">N° Pedido</th>
            <th className="pb-2 pr-4">Estado</th>
            <th className="pb-2 pr-4 text-right">Total</th>
            <th className="pb-2 text-right">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {pedidos.slice(0, 8).map((p) => (
            <tr key={p.id} className="transition hover:bg-zinc-800/30">
              <td className="py-2.5 pr-4 font-medium text-white">
                #{p.numero_pedido}
              </td>
              <td className="py-2.5 pr-4">
                <Badge
                  variant={estadoBadgeVariant[p.estado] ?? "default"}
                  pill
                  dot
                >
                  {estadoLabels[p.estado] ?? p.estado}
                </Badge>
              </td>
              <td className="py-2.5 pr-4 text-right font-medium text-white">
                ${p.monto_total.toLocaleString()}
              </td>
              <td className="py-2.5 text-right text-gray-400">
                {formatDateTime(p.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
