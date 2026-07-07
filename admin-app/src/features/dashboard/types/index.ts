// DASHBOARD TYPES

import type { EstadoPedidoCodigo } from "../../orders/types";

export interface DashboardMetrics {
  total_pedidos_hoy: number;
  total_ventas_hoy: number;
  pedidos_por_estado: Record<EstadoPedidoCodigo, number>;
  productos_mas_vendidos: {
    producto_id: number;
    nombre: string;
    cantidad: number;
  }[];
  ingresos_ultimos_7_dias: { fecha: string; total: number }[];
  total_usuarios_registrados: number;
  productos_bajo_stock: {
    id: number;
    nombre: string;
    stock_cantidad: number;
  }[];
}
