import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "../../../api/pedido.api";
import { getProducts } from "../../../api/producto.api";
import { getCategories } from "../../../api/categoria.api";
import { getIngredients } from "../../../api/ingrediente.api";
import { getApiErrorMessage } from "../../../lib/apiError";

export const DashboardPage = () => {
  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos-admin"],
    queryFn: () => getPedidos({ limit: 100 }),
  });

  const { data: productos = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: ingredientes = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
  });

  const totalPedidos = pedidos.length;
  const pendientes = pedidos.filter((p) => p.estado === "PENDIENTE").length;
  const enPreparacion = pedidos.filter(
    (p) => p.estado === "EN_PREPARACION"
  ).length;
  const completados = pedidos.filter((p) => p.estado === "ENTREGADO").length;
  const cancelados = pedidos.filter((p) => p.estado === "CANCELADO").length;
  const totalVentas = pedidos
    .filter((p) => p.estado === "ENTREGADO")
    .reduce((sum, p) => sum + p.monto_total, 0);
  const productosBajoStock = productos.filter((p) => p.stock_cantidad <= 5);

  return (
    <section className="space-y-6 text-white">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          title="Pedidos totales"
          value={totalPedidos}
          color="text-blue-400"
        />
        <MetricCard
          title="Pendientes"
          value={pendientes}
          color="text-yellow-400"
        />
        <MetricCard
          title="En preparación"
          value={enPreparacion}
          color="text-purple-400"
        />
        <MetricCard
          title="Ventas completadas"
          value={`$${totalVentas.toLocaleString()}`}
          color="text-emerald-400"
        />
        <MetricCard
          title="Completados"
          value={completados}
          color="text-green-400"
        />
        <MetricCard
          title="Cancelados"
          value={cancelados}
          color="text-red-400"
        />
        <MetricCard
          title="Productos"
          value={productos.length}
          color="text-cyan-400"
        />
        <MetricCard
          title="Productos bajo stock"
          value={productosBajoStock.length}
          color="text-orange-400"
        />
      </div>

      {/* Productos bajo stock */}
      {productosBajoStock.length > 0 && (
        <div className="rounded-xl border border-orange-700/50 bg-zinc-900 p-4 shadow-xl">
          <h2 className="mb-3 font-bold text-orange-400">
            ⚠ Productos con stock bajo (&le;5)
          </h2>
          <div className="space-y-1 text-sm">
            {productosBajoStock.map((p) => (
              <div
                key={p.id}
                className="flex justify-between rounded-lg bg-zinc-800/50 px-3 py-2"
              >
                <span>{p.nombre}</span>
                <span className="text-orange-400">{p.stock_cantidad} uds</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counts */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-2xl font-bold">{categorias.length}</p>
          <p className="text-gray-400">Categorías</p>
        </div>
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-2xl font-bold">{ingredientes.length}</p>
          <p className="text-gray-400">Ingredientes</p>
        </div>
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-2xl font-bold">{productos.length}</p>
          <p className="text-gray-400">Productos</p>
        </div>
      </div>
    </section>
  );
};

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
      <p className="text-xs text-gray-400">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
