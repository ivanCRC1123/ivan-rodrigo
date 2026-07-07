// TIPOS DE ORDEN — Alineado con esquemas de backend

export type EstadoPedidoEnum =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

/** Alias para compatibilidad con paneles (heredado) */
export type EstadoPedidoCodigo = EstadoPedidoEnum;

export type FormaPagoEnum =
  | "MERCADO_PAGO"
  | "EFECTIVO"
  | "TRANSFERENCIA";

// --- Read entities ---

export interface PedidoReadSimple {
  id: number;
  numero_pedido: string;
  usuario_id: number;
  estado: EstadoPedidoEnum;
  monto_total: number;
  created_at: string;
}

export interface DetallePedidoRead {
  id: number;
  pedido_id: number;
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  created_at: string;
  deleted_at?: string | null;
}

export interface PedidoReadConDetalles {
  id: number;
  numero_pedido: string;
  usuario_id: number;
  estado: EstadoPedidoEnum;
  forma_pago: FormaPagoEnum;
  monto_total: number;
  direccion_entrega: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  detalles: DetallePedidoRead[];
}

export interface HistorialEstadoRead {
  id: number;
  pedido_id: number;
  usuario_id?: number;
  estado_anterior?: EstadoPedidoEnum;
  estado_nuevo: EstadoPedidoEnum;
  razon?: string;
  created_at: string;
}

export interface EstadoCambiadoResponse {
  mensaje: string;
  pedido_id: number;
  numero_pedido: string;
  estado_anterior: EstadoPedidoEnum;
  estado_nuevo: EstadoPedidoEnum;
  fecha_cambio: string;
}
