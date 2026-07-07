import { useQuery } from "@tanstack/react-query";
import { getPedidos } from "../../orders/services/pedido";
import { getProducts } from "../../products/services/producto";
import { getCategories } from "../../categories/services/categoria";
import { getIngredients } from "../../ingredients/services/ingrediente";

import { Card } from "../../../shared/ui/Card";
import { MetricCard } from "../components/MetricCard";
import { OrderDistributionChart } from "../components/OrderDistributionChart";
import { DailyOrdersChart } from "../components/DailyOrdersChart";
import { DailySalesChart } from "../components/DailySalesChart";
import { RecentOrdersTable } from "../components/RecentOrdersTable";
import { LowStockSection } from "../components/LowStockSection";
import { DashboardSkeleton } from "../components/DashboardSkeleton";

// ─── Constants ───────────────────────────────────────────────

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "#eab308",
  CONFIRMADO: "#3b82f6",
  EN_PREPARACION: "#a855f7",
  ENTREGADO: "#22c55e",
  CANCELADO: "#ef4444",
};

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En Preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

// ─── Helpers ─────────────────────────────────────────────────

type DailyData = {
  date: string;
  label: string;
  pedidos: number;
  ventas: number;
};

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const days = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const d = new Date(dateStr + "T00:00:00");
  return days[d.getDay()];
}

function buildDailyData(
  pedidos: { created_at: string; monto_total: number }[],
): DailyData[] {
  const last7 = getLast7Days();
  const map = new Map<string, { count: number; sales: number }>();
  for (const dateStr of last7) {
    map.set(dateStr, { count: 0, sales: 0 });
  }
  for (const p of pedidos) {
    const day = p.created_at.slice(0, 10);
    if (map.has(day)) {
      const entry = map.get(day)!;
      entry.count++;
      entry.sales += p.monto_total;
    }
  }
  return last7.map((dateStr) => {
    const entry = map.get(dateStr)!;
    return {
      date: dateStr,
      label: getDayLabel(dateStr),
      pedidos: entry.count,
      ventas: entry.sales,
    };
  });
}

/** Compute previous-period sum/count and return trend info */
function computeTrend(
  pedidos: { created_at: string; monto_total: number }[],
  days: number,
  metric: "count" | "sales",
  stateFilter?: string,
): { value: number; direction: "up" | "down" } | undefined {
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setDate(currentStart.getDate() - days);
  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - days);

  let currentPeriod: number;
  let prevPeriod: number;

  const filtered = stateFilter
    ? pedidos.filter((p) => "estado" in p && (p as unknown as { estado: string }).estado === stateFilter)
    : pedidos;

  if (metric === "sales") {
    currentPeriod = filtered
      .filter((p) => new Date(p.created_at) >= currentStart)
      .reduce((s, p) => s + p.monto_total, 0);
    prevPeriod = filtered
      .filter(
        (p) =>
          new Date(p.created_at) >= prevStart && new Date(p.created_at) < currentStart,
      )
      .reduce((s, p) => s + p.monto_total, 0);
  } else {
    currentPeriod = filtered.filter((p) => new Date(p.created_at) >= currentStart).length;
    prevPeriod = filtered.filter(
      (p) =>
        new Date(p.created_at) >= prevStart && new Date(p.created_at) < currentStart,
    ).length;
  }

  if (prevPeriod === 0) return undefined;
  const change = ((currentPeriod - prevPeriod) / prevPeriod) * 100;
  return {
    value: Math.abs(Math.round(change * 10) / 10),
    direction: change >= 0 ? "up" : "down",
  };
}

function getPeriodLabel(days: number): string {
  return `vs. ${days} días ant.`;
}

function formatDate(): string {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── SVG Icon components (inline for zero deps) ──────────────

const DollarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ChefHatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 011.05-1.54 5 5 0 0111.08 0A5.11 5.11 0 0120.59 6 4 4 0 0118 13.87V21H6z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ─── Main Component ──────────────────────────────────────────

export const DashboardPage = () => {
  const {
    data: pedidos = [],
    isLoading: loadingPedidos,
    isError: errorPedidos,
  } = useQuery({
    queryKey: ["pedidos-admin"],
    queryFn: () => getPedidos({ limit: 100 }),
  });

  const {
    data: productos = [],
    isLoading: loadingProductos,
    isError: errorProductos,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 100 }),
  });

  const {
    data: categorias = [],
    isLoading: loadingCategorias,
    isError: errorCategorias,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    data: ingredientes = [],
    isLoading: loadingIngredientes,
    isError: errorIngredientes,
  } = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
  });

  const isLoading =
    loadingPedidos || loadingProductos || loadingCategorias || loadingIngredientes;
  const hasError =
    errorPedidos || errorProductos || errorCategorias || errorIngredientes;

  // ── Data processing ────────────────────────────────────────

  const estadoCounts = Object.entries(ESTADO_LABELS).map(([key, label]) => ({
    name: label,
    value: pedidos.filter((p) => p.estado === key).length,
    color: ESTADO_COLORS[key],
  }));

  const dailyData = buildDailyData(pedidos);

  const totalVentas = pedidos
    .filter((p) => p.estado === "ENTREGADO")
    .reduce((sum, p) => sum + p.monto_total, 0);

  const productosBajoStock = productos.filter((p) => p.stock_cantidad <= 5);

  const totalPedidos = pedidos.length;
  const pendientes = pedidos.filter((p) => p.estado === "PENDIENTE").length;
  const enPreparacion = pedidos.filter((p) => p.estado === "EN_PREPARACION").length;

  // ── Trends (vs. previous 7 days) ───────────────────────────
  const ventasTrend = computeTrend(pedidos, 7, "sales", "ENTREGADO");
  const pedidosTrend = computeTrend(pedidos, 7, "count");
  const pendientesTrend = computeTrend(pedidos, 7, "count", "PENDIENTE");
  const preparacionTrend = computeTrend(pedidos, 7, "count", "EN_PREPARACION");

  // ── Recent orders (last 8, newest first) ───────────────────
  const recentOrders = [...pedidos]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const isEmpty = pedidos.length === 0 && productos.length === 0;

  // ── Render ─────────────────────────────────────────────────

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-rose-700/40 bg-rose-900/15 p-4 text-rose-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-sm">
            Error al cargar algunos datos del dashboard. Revisa la consola para más
            detalles.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
            <CalendarIcon />
            {formatDate()}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Últimos 7 días
          </span>
        </div>
      </div>

      {isEmpty ? (
        /* ── Empty state ─────────────────────────────────── */
        <Card padding="lg">
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
              />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-300">
                No hay datos aún
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Los gráficos aparecerán cuando haya pedidos y productos
                registrados.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* ── KPI Cards Row ─────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Ventas Totales"
              value={`$${totalVentas.toLocaleString()}`}
              icon={<DollarIcon />}
              trend={
                ventasTrend
                  ? { ...ventasTrend, label: getPeriodLabel(7) }
                  : undefined
              }
              accent="emerald"
            />
            <MetricCard
              title="Total Pedidos"
              value={totalPedidos.toLocaleString()}
              icon={<ShoppingBagIcon />}
              trend={
                pedidosTrend
                  ? { ...pedidosTrend, label: getPeriodLabel(7) }
                  : undefined
              }
              accent="violet"
            />
            <MetricCard
              title="Pendientes"
              value={pendientes.toLocaleString()}
              icon={<ClockIcon />}
              trend={
                pendientesTrend
                  ? { ...pendientesTrend, label: getPeriodLabel(7) }
                  : undefined
              }
              accent="amber"
            />
            <MetricCard
              title="En Preparación"
              value={enPreparacion.toLocaleString()}
              icon={<ChefHatIcon />}
              trend={
                preparacionTrend
                  ? { ...preparacionTrend, label: getPeriodLabel(7) }
                  : undefined
              }
              accent="blue"
            />
          </div>

          {/* ── Charts Row ────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card accent="violet" className="lg:col-span-1">
              <div className="mb-1">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Pedidos por estado
                </h2>
              </div>
              <div className="h-64">
                <OrderDistributionChart data={estadoCounts} />
              </div>
            </Card>

            <Card accent="blue" className="lg:col-span-1">
              <div className="mb-1">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Pedidos por día
                </h2>
              </div>
              <div className="h-64">
                <DailyOrdersChart data={dailyData} />
              </div>
            </Card>
          </div>

          {/* ── Full-width Sales chart ────────────────────── */}
          <Card accent="emerald">
            <div className="mb-1">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Ventas por día
              </h2>
            </div>
            <div className="h-64">
              <DailySalesChart data={dailyData} />
            </div>
          </Card>

          {/* ── Bottom section: Recent Orders + Low Stock ─── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Últimos pedidos
                </h2>
                {recentOrders.length > 0 && (
                  <span className="text-xs text-gray-500">
                    Últimos {recentOrders.length}
                  </span>
                )}
              </div>
              <RecentOrdersTable pedidos={recentOrders} />
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Stock bajo
                </h2>
                {productosBajoStock.length > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                    {productosBajoStock.length} productos
                  </span>
                )}
              </div>
              <LowStockSection productos={productosBajoStock} />
            </Card>
          </div>

          {/* ── Quick Counters ────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card padding="sm" hoverable accent="cyan">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorías
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-white">
                    {categorias.length}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
              </div>
            </Card>
            <Card padding="sm" hoverable accent="rose">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingredientes
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-white">
                    {ingredientes.length}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
              </div>
            </Card>
            <Card padding="sm" hoverable accent="violet">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-white">
                    {productos.length}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </section>
  );
};
