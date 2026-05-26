import type MockAdapter from 'axios-mock-adapter';
import {
  MOCK_PEDIDOS,
  MOCK_DETALLES_PEDIDO,
  MOCK_HISTORIAL_PEDIDOS,
  MOCK_PRODUCTOS,
  MOCK_USERS,
  MOCK_DIRECCIONES,
  ESTADOS_PEDIDO,
} from '../mockData';
import { apiResponses, withDelay, extractOffsetParams } from '../mockAdapter';
import type {
  Pedido,
  PedidoRead,
  DetallePedido,
  HistorialEstado,
  CrearPedidoRequest,
  ItemPedidoRequest,
  AvanzarEstadoRequest,
  EstadoPedidoCodigo,
} from '../../types';

// ============================================
// HANDLERS DE PEDIDOS
// Endpoints:
// - GET    /api/v1/pedidos
// - POST   /api/v1/pedidos
// - GET    /api/v1/pedidos/:id
// - PATCH  /api/v1/pedidos/:id/estado
// - PATCH  /api/v1/pedidos/:id/cancelar
// - GET    /api/v1/pedidos/:id/historial
// ============================================

// Datos mutables para mock
let mockPedidos = [...MOCK_PEDIDOS];
let mockDetalles = [...MOCK_DETALLES_PEDIDO];
let mockHistorial = [...MOCK_HISTORIAL_PEDIDOS];

// Máquina de estados FSM
const TRANSICIONES_VALIDAS: Record<EstadoPedidoCodigo, EstadoPedidoCodigo[]> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

const esTransicionValida = (desde: EstadoPedidoCodigo, hasta: EstadoPedidoCodigo): boolean => {
  return TRANSICIONES_VALIDAS[desde]?.includes(hasta) ?? false;
};

const esEstadoTerminal = (estado: EstadoPedidoCodigo): boolean => {
  return estado === 'ENTREGADO' || estado === 'CANCELADO';
};

// Construir PedidoRead completo
const buildPedidoRead = (pedido: Pedido): PedidoRead => {
  const detalles = mockDetalles.filter(d => d.pedido_id === pedido.id);
  const historial = mockHistorial
    .filter(h => h.pedido_id === pedido.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return {
    ...pedido,
    detalles,
    historial,
  };
};

export const setupOrderHandlers = (mock: MockAdapter) => {
  // --- GET /api/v1/pedidos ---
  mock.onGet('/api/v1/pedidos').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { offset, limit } = extractOffsetParams(params);

      // Nota: En mock, devolvemos todos los pedidos sin filtrar por usuario
      // En un escenario real, se filtraría por el usuario autenticado del token

      let filtered = [...mockPedidos];

      // Filtro por estado
      if (params.estado) {
        filtered = filtered.filter(p => p.estado_codigo === params.estado);
      }

      // Filtro por usuario_id (si se proporciona explícitamente para admin)
      if (params.usuario_id) {
        const userId = parseInt(params.usuario_id, 10);
        filtered = filtered.filter(p => p.usuario_id === userId);
      }

      // Ordenar por fecha descendente (más recientes primero)
      filtered.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const total = filtered.length;
      const items = filtered.slice(offset, offset + limit).map(buildPedidoRead);

      return apiResponses.success({
        items,
        total,
        offset,
        limit,
      });
    });
  });

  // --- POST /api/v1/pedidos ---
  mock.onPost('/api/v1/pedidos').reply(async (config) => {
    return withDelay(async () => {
      const body: CrearPedidoRequest = JSON.parse(config.data);

      // Validaciones
      if (!body.items || body.items.length === 0) {
        return apiResponses.validationError('El pedido debe tener al menos un ítem', 'items');
      }

      // Validar items
      for (const item of body.items) {
        if (!item.producto_id || item.producto_id <= 0) {
          return apiResponses.validationError('ID de producto inválido');
        }
        if (!item.cantidad || item.cantidad < 1) {
          return apiResponses.validationError('La cantidad debe ser al menos 1');
        }

        const producto = MOCK_PRODUCTOS.find(p => p.id === item.producto_id);
        if (!producto) {
          return apiResponses.validationError(`Producto #${item.producto_id} no encontrado`);
        }
        if (!producto.disponible) {
          return apiResponses.validationError(`Producto "${producto.nombre}" no está disponible`);
        }
        if (producto.stock_cantidad < item.cantidad) {
          return apiResponses.validationError(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_cantidad}`
          );
        }
      }

      // Validar dirección si se proporciona
      if (body.direccion_id) {
        const direccion = MOCK_DIRECCIONES.find(d => d.id === body.direccion_id);
        if (!direccion) {
          return apiResponses.validationError('Dirección no encontrada', 'direccion_id');
        }
      }

      // Calcular totales
      let subtotal = 0;
      const detallesParaCrear: Omit<DetallePedido, 'id' | 'pedido_id'>[] = [];

      for (const item of body.items) {
        const producto = MOCK_PRODUCTOS.find(p => p.id === item.producto_id)!;
        const precioSnapshot = producto.precio_base;
        
        subtotal += precioSnapshot * item.cantidad;

        detallesParaCrear.push({
          producto_id: item.producto_id,
          nombre_snapshot: producto.nombre,
          precio_snapshot: precioSnapshot,
          cantidad: item.cantidad,
          personalizacion: item.personalizacion || [],
          ingredientes_removidos: (item.personalizacion || []).map(
            id => MOCK_PRODUCTOS.find(p => p.ingredientes.some(pi => pi.ingrediente_id === id))
              ?.ingredientes.find(pi => pi.ingrediente_id === id)?.ingrediente?.nombre || `Ingrediente #${id}`
          ),
        });
      }

      const costoEnvio = 500; // Valor fijo según specs
      const total = subtotal + costoEnvio;

      // Crear pedido
      const newPedidoId = Math.max(...mockPedidos.map(p => p.id), 0) + 1;
      const now = new Date().toISOString();

      const newPedido: Pedido = {
        id: newPedidoId,
        usuario_id: 4, // Por defecto: usuario Juan Pérez (mock)
        estado_codigo: 'PENDIENTE',
        forma_pago_codigo: body.forma_pago_codigo || 'MERCADOPAGO',
        direccion_id: body.direccion_id || null,
        subtotal,
        costo_envio: costoEnvio,
        descuento: 0,
        total,
        notas: body.notas,
        created_at: now,
        updated_at: now,
      };

      mockPedidos.push(newPedido);

      // Crear detalles
      const newDetalleId = Math.max(...mockDetalles.map(d => d.id), 0) + 1;
      for (let i = 0; i < detallesParaCrear.length; i++) {
        mockDetalles.push({
          id: newDetalleId + i,
          pedido_id: newPedidoId,
          ...detallesParaCrear[i],
        });
      }

      // Crear entrada inicial en historial (RN-02: estado_desde = NULL)
      const newHistorialId = Math.max(...mockHistorial.map(h => h.id), 0) + 1;
      mockHistorial.push({
        id: newHistorialId,
        pedido_id: newPedidoId,
        estado_desde: null,
        estado_hasta: 'PENDIENTE',
        usuario_id: 4,
        motivo: 'Pedido creado',
        created_at: now,
      });

      return apiResponses.created(buildPedidoRead(newPedido));
    });
  });

  // --- GET /api/v1/pedidos/:id ---
  mock.onGet(/\/api\/v1\/pedidos\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/pedidos\/(\d+)/);
      const pedidoId = match ? parseInt(match[1], 10) : null;

      if (!pedidoId) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const pedido = mockPedidos.find(p => p.id === pedidoId);
      
      if (!pedido) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      return apiResponses.success(buildPedidoRead(pedido));
    });
  });

  // --- PATCH /api/v1/pedidos/:id/estado ---
  mock.onPatch(/\/api\/v1\/pedidos\/(\d+)\/estado/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/pedidos\/(\d+)\/estado/);
      const pedidoId = match ? parseInt(match[1], 10) : null;

      if (!pedidoId) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const body: AvanzarEstadoRequest = JSON.parse(config.data);
      const { nuevo_estado, motivo } = body;

      if (!nuevo_estado) {
        return apiResponses.validationError('nuevo_estado es requerido', 'nuevo_estado');
      }

      const index = mockPedidos.findIndex(p => p.id === pedidoId);
      if (index === -1) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const pedido = mockPedidos[index];
      const estadoActual = pedido.estado_codigo;

      // Validar estado terminal
      if (esEstadoTerminal(estadoActual)) {
        return apiResponses.validationError(
          `No se puede modificar un pedido en estado ${estadoActual} (estado terminal)`
        );
      }

      // Validar transición FSM
      if (!esTransicionValida(estadoActual, nuevo_estado)) {
        return apiResponses.validationError(
          `Transición inválida: ${estadoActual} → ${nuevo_estado}. ` +
          `Transiciones válidas desde ${estadoActual}: ${TRANSICIONES_VALIDAS[estadoActual].join(', ')}`
        );
      }

      // Validar motivo para CANCELADO (RN-05)
      if (nuevo_estado === 'CANCELADO' && (!motivo || motivo.trim().length === 0)) {
        return apiResponses.validationError(
          'El motivo es obligatorio para cancelar un pedido',
          'motivo'
        );
      }

      // Actualizar pedido
      const now = new Date().toISOString();
      mockPedidos[index] = {
        ...pedido,
        estado_codigo: nuevo_estado,
        updated_at: now,
      };

      // Registrar en historial
      const newHistorialId = Math.max(...mockHistorial.map(h => h.id), 0) + 1;
      mockHistorial.push({
        id: newHistorialId,
        pedido_id: pedidoId,
        estado_desde: estadoActual,
        estado_hasta: nuevo_estado,
        usuario_id: 1, // Admin por defecto en mock
        motivo: motivo || `Cambio de estado: ${estadoActual} → ${nuevo_estado}`,
        created_at: now,
      });

      return apiResponses.success(buildPedidoRead(mockPedidos[index]));
    });
  });

  // --- PATCH /api/v1/pedidos/:id/cancelar ---
  mock.onPatch(/\/api\/v1\/pedidos\/(\d+)\/cancelar/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/pedidos\/(\d+)\/cancelar/);
      const pedidoId = match ? parseInt(match[1], 10) : null;

      if (!pedidoId) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const body = config.data ? JSON.parse(config.data) : {};
      const motivo = body.motivo || 'Cancelación solicitada por el cliente';

      const index = mockPedidos.findIndex(p => p.id === pedidoId);
      if (index === -1) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const pedido = mockPedidos[index];
      const estadoActual = pedido.estado_codigo;

      // Validar que se pueda cancelar
      if (!['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION'].includes(estadoActual)) {
        return apiResponses.validationError(
          `No se puede cancelar un pedido en estado ${estadoActual}`
        );
      }

      // Actualizar pedido
      const now = new Date().toISOString();
      mockPedidos[index] = {
        ...pedido,
        estado_codigo: 'CANCELADO',
        updated_at: now,
      };

      // Registrar en historial
      const newHistorialId = Math.max(...mockHistorial.map(h => h.id), 0) + 1;
      mockHistorial.push({
        id: newHistorialId,
        pedido_id: pedidoId,
        estado_desde: estadoActual,
        estado_hasta: 'CANCELADO',
        usuario_id: 4, // Cliente en mock
        motivo,
        created_at: now,
      });

      return apiResponses.success(buildPedidoRead(mockPedidos[index]));
    });
  });

  // --- GET /api/v1/pedidos/:id/historial ---
  mock.onGet(/\/api\/v1\/pedidos\/(\d+)\/historial/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/pedidos\/(\d+)\/historial/);
      const pedidoId = match ? parseInt(match[1], 10) : null;

      if (!pedidoId) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      // Verificar que el pedido exista
      const pedido = mockPedidos.find(p => p.id === pedidoId);
      if (!pedido) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const historial = mockHistorial
        .filter(h => h.pedido_id === pedidoId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return apiResponses.success(historial);
    });
  });
};

export default setupOrderHandlers;
