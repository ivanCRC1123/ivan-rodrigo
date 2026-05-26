// ============================================
// EXPORTA TODO DEL MÓDULO DE MOCKS
// ============================================

// Data
export * from './mockData';

// Adapter utilities
export * from './mockAdapter';
export { default as createMockAdapter } from './mockAdapter';

// Handlers
export * from './handlers';
export { default as setupAllHandlers } from './handlers';

// Re-export types for convenience
export type {
  User,
  UserRole,
  Ingrediente,
  Categoria,
  CategoriaTreeNode,
  Producto,
  ProductoRead,
  ProductoCreate,
  ProductoUpdate,
  EstadoPedidoCodigo,
  Pedido,
  PedidoRead,
  DetallePedido,
  HistorialEstado,
  CrearPedidoRequest,
  ItemPedidoRequest,
  Pago,
  PagoStatus,
  FormaPago,
  FormaPagoCodigo,
  DireccionEntrega,
  DireccionCreate,
  DireccionUpdate,
  DashboardMetrics,
  ApiError,
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from '../types';

// --- Función de conveniencia para inicializar mocks ---
import type { AxiosInstance } from 'axios';
import { createMockAdapter } from './mockAdapter';
import { setupAllHandlers } from './handlers';

/**
 * Inicializa el mock adapter para una instancia de axios
 * y configura todos los handlers.
 * 
 * @param axiosInstance - Instancia de axios a mockear
 * @returns El mock adapter configurado
 */
export const initializeMocks = (axiosInstance: AxiosInstance) => {
  const mock = createMockAdapter(axiosInstance);
  setupAllHandlers(mock);
  return mock;
};

export default initializeMocks;
