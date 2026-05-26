import type MockAdapter from 'axios-mock-adapter';
import {
  MOCK_PAGOS,
  MOCK_PEDIDOS,
  FORMAS_PAGO,
} from '../mockData';
import { apiResponses, withDelay } from '../mockAdapter';
import type {
  Pago,
  PaymentRequest,
  PagoResponse,
  FormaPago,
} from '../../types';

// ============================================
// HANDLERS DE PAGOS
// Endpoints:
// - GET    /api/v1/formas-pago
// - POST   /api/v1/pagos/crear
// - POST   /api/v1/pagos/webhook
// - GET    /api/v1/pagos/:pedido_id
// ============================================

let mockPagos = [...MOCK_PAGOS];
let mockPedidos = [...MOCK_PEDIDOS];

const createUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

export const setupPaymentHandlers = (mock: MockAdapter) => {
  // --- GET /api/v1/formas-pago ---
  mock.onGet('/api/v1/formas-pago').reply(async () => {
    return withDelay(async () => {
      // Solo devolver formas de pago habilitadas
      const habilitadas = FORMAS_PAGO.filter(fp => fp.habilitado);
      return apiResponses.success(habilitadas);
    });
  });

  // --- POST /api/v1/pagos/crear ---
  mock.onPost('/api/v1/pagos/crear').reply(async (config) => {
    return withDelay(async () => {
      const body: PaymentRequest = JSON.parse(config.data);

      if (!body.pedido_id) {
        return apiResponses.validationError('pedido_id es requerido', 'pedido_id');
      }

      // Buscar pedido
      const pedidoIndex = mockPedidos.findIndex(p => p.id === body.pedido_id);
      if (pedidoIndex === -1) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const pedido = mockPedidos[pedidoIndex];

      // Validar que el pedido esté en PENDIENTE
      if (pedido.estado_codigo !== 'PENDIENTE') {
        return apiResponses.validationError(
          `El pedido ya se encuentra en estado ${pedido.estado_codigo}`
        );
      }

      // Crear pago
      const newPagoId = Math.max(...mockPagos.map(p => p.id), 0) + 1;
      const now = new Date().toISOString();

      const newPago: Pago = {
        id: newPagoId,
        pedido_id: body.pedido_id,
        mp_payment_id: Math.floor(Math.random() * 10000000000) + 10000000000,
        mp_status: 'pending',
        mp_status_detail: 'waiting_payment',
        external_reference: createUUID(),
        idempotency_key: createUUID(),
        monto: pedido.total,
        created_at: now,
        updated_at: now,
      };

      mockPagos.push(newPago);

      // En mock, simulamos que el pago es exitoso inmediatamente (opcional)
      // Para testing, podemos dejarlo en pending o aprobarlo

      const response: PagoResponse = {
        ...newPago,
        init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${newPago.external_reference}`,
      };

      return apiResponses.created(response);
    });
  });

  // --- POST /api/v1/pagos/webhook (IPN MercadoPago) ---
  mock.onPost('/api/v1/pagos/webhook').reply(async (config) => {
    return withDelay(async () => {
      const body = config.data ? JSON.parse(config.data) : {};
      
      // MercadoPago envía:
      // - topic: "payment" | "merchant_order"
      // - id: ID del pago o orden
      // - data: { id: ... }

      const paymentId = body.data?.id || body.id;
      const topic = body.topic;

      if (!paymentId) {
        // MercadoPago a veces envía notificaciones sin datos (verificación)
        return apiResponses.success({ status: 'ok', message: 'Webhook recibido' });
      }

      // Buscar pago por mp_payment_id
      const pagoIndex = mockPagos.findIndex(p => p.mp_payment_id === Number(paymentId));
      
      if (pagoIndex === -1) {
        return apiResponses.success({ status: 'ok', message: 'Pago no encontrado en sistema' });
      }

      const pago = mockPagos[pagoIndex];
      const pedidoIndex = mockPedidos.findIndex(p => p.id === pago.pedido_id);

      if (pedidoIndex === -1) {
        return apiResponses.success({ status: 'error', message: 'Pedido asociado no encontrado' });
      }

      const now = new Date().toISOString();

      // En mock, simulamos que el pago fue aprobado
      mockPagos[pagoIndex] = {
        ...pago,
        mp_status: 'approved',
        mp_status_detail: 'accredited',
        updated_at: now,
      };

      // Actualizar pedido: PENDIENTE → CONFIRMADO
      if (mockPedidos[pedidoIndex].estado_codigo === 'PENDIENTE') {
        mockPedidos[pedidoIndex] = {
          ...mockPedidos[pedidoIndex],
          estado_codigo: 'CONFIRMADO',
          updated_at: now,
        };
      }

      return apiResponses.success({ 
        status: 'ok', 
        message: 'Pago procesado exitosamente',
        pago_id: pago.id,
        pedido_id: pago.pedido_id,
        nuevo_estado: 'CONFIRMADO'
      });
    });
  });

  // --- GET /api/v1/pagos/:pedido_id ---
  mock.onGet(/\/api\/v1\/pagos\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/pagos\/(\d+)/);
      const pedidoId = match ? parseInt(match[1], 10) : null;

      if (!pedidoId) {
        return apiResponses.notFound('Pago no encontrado');
      }

      // Buscar todos los pagos asociados a este pedido
      const pagos = mockPagos.filter(p => p.pedido_id === pedidoId);

      if (pagos.length === 0) {
        return apiResponses.notFound('No se encontraron pagos para este pedido');
      }

      // Devolver el más reciente
      pagos.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return apiResponses.success(pagos[0]);
    });
  });

  // --- GET /api/v1/pagos/pedido/:pedido_id (alternativa) ---
  mock.onGet(/\/api\/v1\/pagos\/pedido\/(\d+)/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/pagos\/pedido\/(\d+)/);
      const pedidoId = match ? parseInt(match[1], 10) : null;

      if (!pedidoId) {
        return apiResponses.notFound('Pago no encontrado');
      }

      const pagos = mockPagos.filter(p => p.pedido_id === pedidoId);
      pagos.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return apiResponses.success({
        items: pagos,
        total: pagos.length,
        ultimo: pagos[0] || null,
      });
    });
  });

  // --- POST /api/v1/pagos/procesar-prueba (endpoint extra para testing) ---
  mock.onPost('/api/v1/pagos/procesar-prueba').reply(async (config) => {
    return withDelay(async () => {
      const body = config.data ? JSON.parse(config.data) : {};
      const { pago_id, status = 'approved' } = body;

      if (!pago_id) {
        return apiResponses.validationError('pago_id es requerido');
      }

      const pagoIndex = mockPagos.findIndex(p => p.id === pago_id);
      if (pagoIndex === -1) {
        return apiResponses.notFound('Pago no encontrado');
      }

      const pago = mockPagos[pagoIndex];
      const pedidoIndex = mockPedidos.findIndex(p => p.id === pago.pedido_id);

      if (pedidoIndex === -1) {
        return apiResponses.notFound('Pedido no encontrado');
      }

      const now = new Date().toISOString();

      mockPagos[pagoIndex] = {
        ...pago,
        mp_status: status,
        mp_status_detail: status === 'approved' ? 'accredited' : 
                        status === 'rejected' ? 'rejected' : 'pending',
        updated_at: now,
      };

      // Si el pago es aprobado, avanzar pedido
      if (status === 'approved' && mockPedidos[pedidoIndex].estado_codigo === 'PENDIENTE') {
        mockPedidos[pedidoIndex] = {
          ...mockPedidos[pedidoIndex],
          estado_codigo: 'CONFIRMADO',
          updated_at: now,
        };
      }

      return apiResponses.success({
        pago: mockPagos[pagoIndex],
        pedido: mockPedidos[pedidoIndex],
        message: `Pago marcado como ${status}`,
      });
    });
  });
};

export default setupPaymentHandlers;
