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
  | "MERCADO_PAGO"
  | "EFECTIVO"
  | "TRANSFERENCIA";

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
  | "ENTREGADO"
  | "CANCELADO";

export interface PedidoReadSimple {
  id: number;
  numero_pedido: string;
  usuario_id: number;
  estado: EstadoPedidoEnum;
  forma_pago: FormaPagoEnum;
  monto_total: number;
  created_at: string;
}
