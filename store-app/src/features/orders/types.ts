export interface PedidoCreate {
  usuario_id: number;
  forma_pago: FormaPagoEnum;
  direccion_entrega: string;
  observaciones?: string;
  detalles: DetallePedidoCreate[];
}

export interface DetallePedidoCreate {
  producto_id: number;
  cantidad: number;
}

export type FormaPagoEnum =
  | "TARJETA_CREDITO"
  | "TARJETA_DEBITO"
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "MERCADO_PAGO";

export interface PedidoCreatedResponse {
  mensaje: string;
  pedido_id: number;
  numero_pedido: string;
  monto_total: number;
  estado: EstadoPedidoEnum;
}

export type EstadoPedidoEnum =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export interface PedidoReadSimple {
  id: number;
  numero_pedido: string;
  usuario_id: number;
  estado: EstadoPedidoEnum;
  monto_total: number;
  created_at: string;
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

export interface DetallePedidoRead {
  id: number;
  pedido_id: number;
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  created_at: string;
}
