import type MockAdapter from 'axios-mock-adapter';
import {
  MOCK_DIRECCIONES,
} from '../mockData';
import { apiResponses, withDelay, extractOffsetParams } from '../mockAdapter';
import type {
  DireccionEntrega,
  DireccionCreate,
  DireccionUpdate,
} from '../../types';

// ============================================
// HANDLERS DE DIRECCIONES
// Endpoints:
// - GET    /api/v1/direcciones
// - POST   /api/v1/direcciones
// - GET    /api/v1/direcciones/:id
// - PUT    /api/v1/direcciones/:id
// - PATCH  /api/v1/direcciones/:id/predeterminada
// - DELETE /api/v1/direcciones/:id
// ============================================

let mockDirecciones = [...MOCK_DIRECCIONES];

export const setupAddressHandlers = (mock: MockAdapter) => {
  // --- GET /api/v1/direcciones ---
  mock.onGet('/api/v1/direcciones').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { offset, limit } = extractOffsetParams(params);

      // En mock, devolvemos todas las direcciones
      // En un escenario real, filtraríamos por el usuario autenticado

      let filtered = [...mockDirecciones];

      // Filtro por usuario_id (si se proporciona para admin)
      if (params.usuario_id) {
        const userId = parseInt(params.usuario_id, 10);
        filtered = filtered.filter(d => d.usuario_id === userId);
      }

      // Ordenar: principal primero, luego por fecha
      filtered.sort((a, b) => {
        if (a.es_principal !== b.es_principal) {
          return a.es_principal ? -1 : 1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const total = filtered.length;
      const items = filtered.slice(offset, offset + limit);

      return apiResponses.success({
        items,
        total,
        offset,
        limit,
      });
    });
  });

  // --- POST /api/v1/direcciones ---
  mock.onPost('/api/v1/direcciones').reply(async (config) => {
    return withDelay(async () => {
      const body: DireccionCreate = JSON.parse(config.data);

      // Validaciones
      if (!body.linea1 || body.linea1.trim().length === 0) {
        return apiResponses.validationError('La dirección es requerida', 'linea1');
      }
      if (!body.ciudad || body.ciudad.trim().length === 0) {
        return apiResponses.validationError('La ciudad es requerida', 'ciudad');
      }
      if (!body.codigo_postal || body.codigo_postal.trim().length === 0) {
        return apiResponses.validationError('El código postal es requerido', 'codigo_postal');
      }

      const newId = Math.max(...mockDirecciones.map(d => d.id), 0) + 1;
      const now = new Date().toISOString();

      // Si es la primera dirección o se marca como principal,
      // desmarcar las demás del mismo usuario
      const usuarioId = 4; // Mock: usuario actual
      const esPrincipal = body.es_principal ?? mockDirecciones.filter(d => d.usuario_id === usuarioId).length === 0;

      if (esPrincipal) {
        mockDirecciones = mockDirecciones.map(d => 
          d.usuario_id === usuarioId ? { ...d, es_principal: false } : d
        );
      }

      const newDireccion: DireccionEntrega = {
        id: newId,
        usuario_id: usuarioId,
        alias: body.alias || `Dirección ${newId}`,
        linea1: body.linea1,
        linea2: body.linea2,
        ciudad: body.ciudad,
        codigo_postal: body.codigo_postal,
        referencia: body.referencia,
        es_principal: esPrincipal,
        created_at: now,
        updated_at: now,
      };

      mockDirecciones.push(newDireccion);

      return apiResponses.created(newDireccion);
    });
  });

  // --- GET /api/v1/direcciones/:id ---
  mock.onGet(/\/api\/v1\/direcciones\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/direcciones\/(\d+)/);
      const dirId = match ? parseInt(match[1], 10) : null;

      if (!dirId) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      const direccion = mockDirecciones.find(d => d.id === dirId);
      
      if (!direccion) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      return apiResponses.success(direccion);
    });
  });

  // --- PUT /api/v1/direcciones/:id ---
  mock.onPut(/\/api\/v1\/direcciones\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/direcciones\/(\d+)/);
      const dirId = match ? parseInt(match[1], 10) : null;

      if (!dirId) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      const body: DireccionUpdate = JSON.parse(config.data);
      const index = mockDirecciones.findIndex(d => d.id === dirId);

      if (index === -1) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      // Si se marca como principal, desmarcar las demás del mismo usuario
      if (body.es_principal === true) {
        const usuarioId = mockDirecciones[index].usuario_id;
        mockDirecciones = mockDirecciones.map(d => 
          d.usuario_id === usuarioId ? { ...d, es_principal: false } : d
        );
      }

      const updatedDireccion: DireccionEntrega = {
        ...mockDirecciones[index],
        ...(body.alias !== undefined && { alias: body.alias }),
        ...(body.linea1 !== undefined && { linea1: body.linea1 }),
        ...(body.linea2 !== undefined && { linea2: body.linea2 }),
        ...(body.ciudad !== undefined && { ciudad: body.ciudad }),
        ...(body.codigo_postal !== undefined && { codigo_postal: body.codigo_postal }),
        ...(body.referencia !== undefined && { referencia: body.referencia }),
        ...(body.es_principal !== undefined && { es_principal: body.es_principal }),
        updated_at: new Date().toISOString(),
      };

      mockDirecciones[index] = updatedDireccion;

      return apiResponses.success(updatedDireccion);
    });
  });

  // --- PATCH /api/v1/direcciones/:id/predeterminada ---
  mock.onPatch(/\/api\/v1\/direcciones\/(\d+)\/predeterminada/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/direcciones\/(\d+)\/predeterminada/);
      const dirId = match ? parseInt(match[1], 10) : null;

      if (!dirId) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      const index = mockDirecciones.findIndex(d => d.id === dirId);

      if (index === -1) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      const direccion = mockDirecciones[index];

      // Desmarcar todas las demás del mismo usuario
      mockDirecciones = mockDirecciones.map(d => 
        d.usuario_id === direccion.usuario_id ? { ...d, es_principal: false } : d
      );

      // Marcar esta como principal
      mockDirecciones[index] = {
        ...direccion,
        es_principal: true,
        updated_at: new Date().toISOString(),
      };

      return apiResponses.success(mockDirecciones[index]);
    });
  });

  // --- DELETE /api/v1/direcciones/:id ---
  mock.onDelete(/\/api\/v1\/direcciones\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/direcciones\/(\d+)/);
      const dirId = match ? parseInt(match[1], 10) : null;

      if (!dirId) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      const index = mockDirecciones.findIndex(d => d.id === dirId);

      if (index === -1) {
        return apiResponses.notFound('Dirección no encontrada');
      }

      // Si era la principal, marcar otra como principal si existe
      const eliminada = mockDirecciones[index];
      mockDirecciones.splice(index, 1);

      if (eliminada.es_principal) {
        const restantes = mockDirecciones.filter(d => d.usuario_id === eliminada.usuario_id);
        if (restantes.length > 0) {
          const otraIndex = mockDirecciones.findIndex(d => d.id === restantes[0].id);
          mockDirecciones[otraIndex] = {
            ...mockDirecciones[otraIndex],
            es_principal: true,
            updated_at: new Date().toISOString(),
          };
        }
      }

      return apiResponses.noContent();
    });
  });

  // --- GET /api/v1/direcciones/principal (endpoint conveniencia) ---
  mock.onGet('/api/v1/direcciones/principal').reply(async (config) => {
    return withDelay(async () => {
      const usuarioId = 4; // Mock: usuario actual
      const principal = mockDirecciones.find(d => d.usuario_id === usuarioId && d.es_principal);

      if (!principal) {
        // Devolver la primera si no hay principal
        const primera = mockDirecciones.find(d => d.usuario_id === usuarioId);
        if (primera) {
          return apiResponses.success(primera);
        }
        return apiResponses.notFound('No hay direcciones registradas');
      }

      return apiResponses.success(principal);
    });
  });
};

export default setupAddressHandlers;
