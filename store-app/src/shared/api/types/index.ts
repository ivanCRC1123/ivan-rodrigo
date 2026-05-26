// ============================================
// TYPES COMUNES (store-app y admin-app)
// ============================================

// --- Common Types ---
export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// --- Auth Types ---
export type UserRole = 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT';

export interface User {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// --- Ingredient Types ---
export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion?: string;
  es_alergeno: boolean;
  created_at: string;
  updated_at: string;
}

export interface IngredienteCreate {
  nombre: string;
  descripcion?: string;
  es_alergeno?: boolean;
}

export interface IngredienteUpdate {
  nombre?: string;
  descripcion?: string;
  es_alergeno?: boolean;
}

export interface ProductoIngrediente {
  producto_id: number;
  ingrediente_id: number;
  es_removible: boolean;
  ingrediente?: Ingrediente;
}

// --- Category Types ---
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CategoriaTreeNode extends Categoria {
  children: CategoriaTreeNode[];
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number | null;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number | null;
}

// --- Product Types ---
export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  categorias: Categoria[];
  ingredientes: ProductoIngrediente[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ProductoRead {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  categorias: Categoria[];
  ingredientes: Ingrediente[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagenes_url?: string[];
  stock_cantidad?: number;
  disponible?: boolean;
  categoria_ids?: number[];
  ingredientes?: { ingrediente_id: number; es_removible: boolean }[];
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio_base?: number;
  imagenes_url?: string[];
  stock_cantidad?: number;
  disponible?: boolean;
  categoria_ids?: number[];
  ingredientes?: { ingrediente_id: number; es_removible: boolean }[];
}

export interface DisponibilidadUpdate {
  disponible: boolean;
}

// --- Order Status Types ---
export type EstadoPedidoCodigo = 
  | 'PENDIENTE' 
  | 'CONFIRMADO' 
  | 'EN_PREPARACION' 
  | 'EN_CAMINO' 
  | 'ENTREGADO' 
  | 'CANCELADO';

export interface EstadoPedido {
  codigo: EstadoPedidoCodigo;
  nombre: string;
  descripcion?: string;
  orden: number;
  es_terminal: boolean;
}

// --- Order Types ---
export interface ItemPedidoRequest {
  producto_id: number;
  cantidad: number;
  personalizacion?: number[];
}

export interface CrearPedidoRequest {
  items: ItemPedidoRequest[];
  forma_pago_codigo: string;
  direccion_id?: number | null;
  notas?: string;
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  nombre_snapshot: string;
  precio_snapshot: number;
  cantidad: number;
  personalizacion?: number[];
  ingredientes_removidos?: string[];
}

export interface HistorialEstado {
  id: number;
  pedido_id: number;
  estado_desde?: EstadoPedidoCodigo | null;
  estado_hasta: EstadoPedidoCodigo;
  usuario_id?: number | null;
  motivo?: string;
  created_at: string;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado_codigo: EstadoPedidoCodigo;
  forma_pago_codigo: string;
  direccion_id?: number | null;
  subtotal: number;
  costo_envio: number;
  descuento: number;
  total: number;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoRead extends Pedido {
  detalles?: DetallePedido[];
  historial?: HistorialEstado[];
  pago?: Pago;
}

export interface AvanzarEstadoRequest {
  nuevo_estado: EstadoPedidoCodigo;
  motivo?: string;
}

// --- Payment Types ---
export type PagoStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_process';

export type FormaPagoCodigo = 'MERCADOPAGO' | 'EFECTIVO' | 'TRANSFERENCIA';

export interface FormaPago {
  codigo: FormaPagoCodigo;
  nombre: string;
  habilitado: boolean;
}

export interface Pago {
  id: number;
  pedido_id: number;
  mp_payment_id?: number | null;
  mp_status: PagoStatus;
  mp_status_detail?: string;
  external_reference: string;
  idempotency_key: string;
  monto: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequest {
  pedido_id: number;
  card_token?: string;
  payment_method_id?: string;
  installments?: number;
}

export interface PagoResponse extends Pago {
  init_point?: string;
}

// --- Address Types ---
export interface DireccionEntrega {
  id: number;
  usuario_id: number;
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad: string;
  codigo_postal: string;
  referencia?: string;
  es_principal: boolean;
  created_at: string;
  updated_at: string;
}

export interface DireccionCreate {
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad: string;
  codigo_postal: string;
  referencia?: string;
  es_principal?: boolean;
}

export interface DireccionUpdate {
  alias?: string;
  linea1?: string;
  linea2?: string;
  ciudad?: string;
  codigo_postal?: string;
  referencia?: string;
  es_principal?: boolean;
}

// --- Admin Types ---
export interface DashboardMetrics {
  total_pedidos_hoy: number;
  total_ventas_hoy: number;
  pedidos_por_estado: Record<EstadoPedidoCodigo, number>;
  productos_mas_vendidos: { producto_id: number; nombre: string; cantidad: number }[];
  ingresos_ultimos_7_dias: { fecha: string; total: number }[];
  total_usuarios_registrados: number;
  productos_bajo_stock: { id: number; nombre: string; stock_cantidad: number }[];
}

export interface UserAdminUpdate {
  roles?: UserRole[];
  nombre?: string;
  apellido?: string;
  email?: string;
}
