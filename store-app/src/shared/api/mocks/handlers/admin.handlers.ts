import type MockAdapter from 'axios-mock-adapter';
import {
  MOCK_USERS,
  MOCK_PEDIDOS,
  MOCK_DASHBOARD_METRICS,
  MOCK_PRODUCTOS,
  MOCK_DIRECCIONES,
} from '../mockData';
import { apiResponses, withDelay, extractOffsetParams, extractPaginationParams } from '../mockAdapter';
import type {
  User,
  UserRole,
  DashboardMetrics,
} from '../../types';

// ============================================
// HANDLERS DE ADMIN
// Endpoints:
// - GET /api/v1/admin/usuarios
// - GET /api/v1/admin/usuarios/:id
// - PUT /api/v1/admin/usuarios/:id
// - PUT /api/v1/admin/usuarios/:id/rol
// - GET /api/v1/admin/metricas
// - GET /api/v1/admin/metricas/detalladas
// ============================================

let mockUsers = [...MOCK_USERS];

export const setupAdminHandlers = (mock: MockAdapter) => {
  // --- GET /api/v1/admin/usuarios ---
  mock.onGet('/api/v1/admin/usuarios').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { page, size } = extractPaginationParams(params);

      let filtered = [...mockUsers];

      // Filtro por rol
      if (params.rol) {
        filtered = filtered.filter(u => u.roles.includes(params.rol as UserRole));
      }

      // Filtro por búsqueda (nombre o email)
      if (params.search) {
        const searchTerm = (params.search as string).toLowerCase();
        filtered = filtered.filter(u =>
          u.nombre.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm) ||
          (u.apellido && u.apellido.toLowerCase().includes(searchTerm))
        );
      }

      // Ordenar por fecha descendente
      filtered.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return apiResponses.paginated(filtered, page, size);
    });
  });

  // --- GET /api/v1/admin/usuarios/:id ---
  mock.onGet(/\/api\/v1\/admin\/usuarios\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/admin\/usuarios\/(\d+)/);
      const userId = match ? parseInt(match[1], 10) : null;

      if (!userId) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      // Incluir datos adicionales para admin
      const userDetail = {
        ...user,
        // Agregar datos extra como cantidad de pedidos, etc.
        pedidos_count: MOCK_PEDIDOS.filter(p => p.usuario_id === userId).length,
        direcciones: MOCK_DIRECCIONES.filter(d => d.usuario_id === userId),
      };

      return apiResponses.success(userDetail);
    });
  });

  // --- PUT /api/v1/admin/usuarios/:id ---
  mock.onPut(/\/api\/v1\/admin\/usuarios\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/admin\/usuarios\/(\d+)/);
      const userId = match ? parseInt(match[1], 10) : null;

      if (!userId) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      const body = JSON.parse(config.data);
      const index = mockUsers.findIndex(u => u.id === userId);

      if (index === -1) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      const updatedUser: User = {
        ...mockUsers[index],
        ...(body.nombre !== undefined && { nombre: body.nombre }),
        ...(body.apellido !== undefined && { apellido: body.apellido }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.telefono !== undefined && { telefono: body.telefono }),
        ...(body.roles !== undefined && { roles: body.roles }),
        updated_at: new Date().toISOString(),
      };

      mockUsers[index] = updatedUser;

      return apiResponses.success(updatedUser);
    });
  });

  // --- PUT /api/v1/admin/usuarios/:id/rol ---
  mock.onPut(/\/api\/v1\/admin\/usuarios\/(\d+)\/rol/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/admin\/usuarios\/(\d+)\/rol/);
      const userId = match ? parseInt(match[1], 10) : null;

      if (!userId) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      const body = JSON.parse(config.data);
      const roles: UserRole[] = body.roles || (body.rol ? [body.rol] : undefined);

      if (!roles || roles.length === 0) {
        return apiResponses.validationError('Se debe especificar al menos un rol', 'roles');
      }

      // Validar roles
      const validRoles: UserRole[] = ['ADMIN', 'STOCK', 'PEDIDOS', 'CLIENT'];
      const invalidRoles = roles.filter(r => !validRoles.includes(r));
      
      if (invalidRoles.length > 0) {
        return apiResponses.validationError(`Roles inválidos: ${invalidRoles.join(', ')}`);
      }

      const index = mockUsers.findIndex(u => u.id === userId);

      if (index === -1) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      mockUsers[index] = {
        ...mockUsers[index],
        roles,
        updated_at: new Date().toISOString(),
      };

      return apiResponses.success(mockUsers[index]);
    });
  });

  // --- DELETE /api/v1/admin/usuarios/:id (soft delete) ---
  mock.onDelete(/\/api\/v1\/admin\/usuarios\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/admin\/usuarios\/(\d+)/);
      const userId = match ? parseInt(match[1], 10) : null;

      if (!userId) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      const index = mockUsers.findIndex(u => u.id === userId);

      if (index === -1) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      // No permitir eliminarse a sí mismo (en mock, admin es id=1)
      if (userId === 1) {
        return apiResponses.forbidden('No se puede eliminar al usuario administrador principal');
      }

      // Soft delete
      mockUsers[index] = {
        ...mockUsers[index],
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return apiResponses.noContent();
    });
  });

  // ============================================
  // MÉTRICAS DASHBOARD
  // ============================================

  // --- GET /api/v1/admin/metricas ---
  mock.onGet('/api/v1/admin/metricas').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const periodo = params.periodo || 'hoy'; // hoy, semana, mes, año

      // Para mock, devolvemos las métricas base con pequeñas variaciones
      // según el período solicitado

      let metricas = { ...MOCK_DASHBOARD_METRICS };

      if (periodo === 'semana') {
        metricas = {
          ...metricas,
          total_pedidos_hoy: 85,
          total_ventas_hoy: 985000,
        };
      } else if (periodo === 'mes') {
        metricas = {
          ...metricas,
          total_pedidos_hoy: 320,
          total_ventas_hoy: 3850000,
        };
      }

      return apiResponses.success(metricas);
    });
  });

  // --- GET /api/v1/admin/metricas/detalladas ---
  mock.onGet('/api/v1/admin/metricas/detalladas').reply(async () => {
    return withDelay(async () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Métricas adicionales para dashboard detallado
      const metricasDetalladas = {
        ...MOCK_DASHBOARD_METRICS,
        
        // Resumen rápido
        resumen: {
          pedidos_hoy: MOCK_DASHBOARD_METRICS.total_pedidos_hoy,
          ventas_hoy: MOCK_DASHBOARD_METRICS.total_ventas_hoy,
          ticket_promedio: MOCK_DASHBOARD_METRICS.total_pedidos_hoy > 0 
            ? Math.round(MOCK_DASHBOARD_METRICS.total_ventas_hoy / MOCK_DASHBOARD_METRICS.total_pedidos_hoy)
            : 0,
        },

        // Comparativa con ayer
        comparativa: {
          pedidos_ayer: 10,
          ventas_ayer: 125000,
          variacion_pedidos: 20, // +20%
          variacion_ventas: 16.64, // +16.64%
        },

        // Estados actuales
        estados_actuales: {
          total_pendientes: MOCK_PEDIDOS.filter(p => p.estado_codigo === 'PENDIENTE').length,
          total_en_preparacion: MOCK_PEDIDOS.filter(p => p.estado_codigo === 'EN_PREPARACION').length,
          total_en_camino: MOCK_PEDIDOS.filter(p => p.estado_codigo === 'EN_CAMINO').length,
          total_entregados_hoy: MOCK_DASHBOARD_METRICS.pedidos_por_estado.ENTREGADO,
        },

        // Productos
        productos: {
          total_activos: MOCK_PRODUCTOS.filter(p => p.disponible && !p.deleted_at).length,
          total_bajo_stock: MOCK_DASHBOARD_METRICS.productos_bajo_stock.length,
          sin_stock: MOCK_PRODUCTOS.filter(p => p.stock_cantidad === 0).length,
        },

        // Usuarios
        usuarios: {
          total_registrados: MOCK_DASHBOARD_METRICS.total_usuarios_registrados,
          nuevos_hoy: 1,
          activos_ultimos_7dias: 4,
        },

        // Horarios pico (simulados)
        horarios_pico: [
          { hora: '12:00', pedidos: 8 },
          { hora: '13:00', pedidos: 15 },
          { hora: '14:00', pedidos: 12 },
          { hora: '19:00', pedidos: 10 },
          { hora: '20:00', pedidos: 18 },
          { hora: '21:00', pedidos: 14 },
        ],

        // Formas de pago utilizadas hoy
        formas_pago: [
          { codigo: 'MERCADOPAGO', nombre: 'MercadoPago', cantidad: 10, monto: 120000 },
          { codigo: 'EFECTIVO', nombre: 'Efectivo', cantidad: 2, monto: 25800 },
        ],
      };

      return apiResponses.success(metricasDetalladas);
    });
  });

  // --- GET /api/v1/admin/pedidos/estadisticas ---
  mock.onGet('/api/v1/admin/pedidos/estadisticas').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const dias = params.dias ? parseInt(params.dias, 10) : 7;

      // Generar datos para los últimos N días
      const datos = [];
      for (let i = dias - 1; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        
        datos.push({
          fecha: fechaStr,
          pedidos: Math.floor(Math.random() * 15) + 5,
          ventas: Math.floor(Math.random() * 200000) + 50000,
          ticket_promedio: Math.floor(Math.random() * 8000) + 4000,
        });
      }

      return apiResponses.success({
        periodo: `${dias} días`,
        datos,
        resumen: {
          total_pedidos: datos.reduce((sum, d) => sum + d.pedidos, 0),
          total_ventas: datos.reduce((sum, d) => sum + d.ventas, 0),
          promedio_diario: Math.round(datos.reduce((sum, d) => sum + d.ventas, 0) / dias),
        },
      });
    });
  });

  // ============================================
  // ENDPOINTS EXTRAS PARA ADMIN
  // ============================================

  // --- GET /api/v1/admin/productos/bajo-stock ---
  mock.onGet('/api/v1/admin/productos/bajo-stock').reply(async () => {
    return withDelay(async () => {
      const bajoStock = MOCK_PRODUCTOS.filter(p => p.stock_cantidad < 10 && p.disponible);
      return apiResponses.success({
        items: bajoStock,
        total: bajoStock.length,
        umbral: 10,
      });
    });
  });

  // --- GET /api/v1/admin/ventas/por-categoria ---
  mock.onGet('/api/v1/admin/ventas/por-categoria').reply(async () => {
    return withDelay(async () => {
      // Datos simulados de ventas por categoría
      const ventasPorCategoria = [
        { categoria_id: 4, categoria_nombre: 'Pizzas', cantidad: 45, monto: 382500 },
        { categoria_id: 5, categoria_nombre: 'Hamburguesas', cantidad: 38, monto: 323000 },
        { categoria_id: 6, categoria_nombre: 'Empanadas', cantidad: 25, monto: 287500 },
        { categoria_id: 2, categoria_nombre: 'Bebidas', cantidad: 80, monto: 144000 },
        { categoria_id: 3, categoria_nombre: 'Postres', cantidad: 20, monto: 85000 },
      ];

      return apiResponses.success({
        items: ventasPorCategoria,
        total: ventasPorCategoria.length,
      });
    });
  });
};

export default setupAdminHandlers;
