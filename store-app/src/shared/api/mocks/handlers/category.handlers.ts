import type MockAdapter from 'axios-mock-adapter';
import {
  MOCK_CATEGORIAS,
  buildCategoryTree,
} from '../mockData';
import { apiResponses, withDelay, extractOffsetParams } from '../mockAdapter';
import type {
  Categoria,
  CategoriaTreeNode,
  CategoriaCreate,
  CategoriaUpdate,
} from '../../types';

// ============================================
// HANDLERS DE CATEGORÍAS
// Endpoints:
// - GET    /api/v1/categorias (tree)
// - GET    /api/v1/categorias/:id
// - POST   /api/v1/categorias
// - PUT    /api/v1/categorias/:id
// - DELETE /api/v1/categorias/:id
// ============================================

let mockCategorias = [...MOCK_CATEGORIAS];

export const setupCategoryHandlers = (mock: MockAdapter) => {
  // --- GET /api/v1/categorias ---
  // Devuelve árbol jerárquico o lista plana según parámetro ?flat=true
  mock.onGet('/api/v1/categorias').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { offset, limit } = extractOffsetParams(params);

      // Si ?flat=true, devolver lista plana
      if (params.flat === true || params.flat === 'true') {
        const total = mockCategorias.length;
        const items = mockCategorias.slice(offset, offset + limit);
        return apiResponses.success({ items, total, offset, limit });
      }

      // Por defecto: devolver árbol jerárquico
      const tree = buildCategoryTree();
      return apiResponses.success(tree);
    });
  });

  // --- GET /api/v1/categorias/:id ---
  mock.onGet(/\/api\/v1\/categorias\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/categorias\/(\d+)/);
      const catId = match ? parseInt(match[1], 10) : null;

      if (!catId) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      const categoria = mockCategorias.find(c => c.id === catId);
      
      if (!categoria) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      // Incluir hijos en la respuesta
      const withChildren: CategoriaTreeNode = {
        ...categoria,
        children: mockCategorias
          .filter(c => c.parent_id === catId)
          .map(c => ({ ...c, children: [] })),
      };

      return apiResponses.success(withChildren);
    });
  });

  // --- GET /api/v1/categorias/:id/productos ---
  // Productos de una categoría específica
  mock.onGet(/\/api\/v1\/categorias\/(\d+)\/productos/).reply(async (config) => {
    return withDelay(async () => {
      // Este endpoint puede ser manejado simplemente redirigiendo
      // a productos con filtro de categoría. Por ahora devolvemos OK.
      return apiResponses.success([]);
    });
  });

  // --- POST /api/v1/categorias ---
  mock.onPost('/api/v1/categorias').reply(async (config) => {
    return withDelay(async () => {
      const body: CategoriaCreate = JSON.parse(config.data);

      if (!body.nombre || body.nombre.trim().length === 0) {
        return apiResponses.validationError('El nombre es requerido', 'nombre');
      }

      // Verificar nombre duplicado (mismo nivel de jerarquía)
      const duplicate = mockCategorias.find(
        c => c.nombre.toLowerCase() === body.nombre!.toLowerCase() && 
             c.parent_id === body.parent_id
      );

      if (duplicate) {
        return apiResponses.conflict('Ya existe una categoría con ese nombre en este nivel');
      }

      // Validar parent_id si se proporciona
      if (body.parent_id !== undefined && body.parent_id !== null) {
        const parent = mockCategorias.find(c => c.id === body.parent_id);
        if (!parent) {
          return apiResponses.validationError('La categoría padre no existe', 'parent_id');
        }
      }

      const newId = Math.max(...mockCategorias.map(c => c.id), 0) + 1;

      const newCategoria: Categoria = {
        id: newId,
        nombre: body.nombre,
        descripcion: body.descripcion || '',
        imagen_url: body.imagen_url,
        parent_id: body.parent_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockCategorias.push(newCategoria);

      return apiResponses.created(newCategoria);
    });
  });

  // --- PUT /api/v1/categorias/:id ---
  mock.onPut(/\/api\/v1\/categorias\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/categorias\/(\d+)/);
      const catId = match ? parseInt(match[1], 10) : null;

      if (!catId) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      const body: CategoriaUpdate = JSON.parse(config.data);
      const index = mockCategorias.findIndex(c => c.id === catId);

      if (index === -1) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      // Validar que no se haga padre a sí misma
      if (body.parent_id === catId) {
        return apiResponses.validationError('Una categoría no puede ser padre de sí misma', 'parent_id');
      }

      const updatedCategoria: Categoria = {
        ...mockCategorias[index],
        ...(body.nombre !== undefined && { nombre: body.nombre }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
        ...(body.imagen_url !== undefined && { imagen_url: body.imagen_url }),
        ...(body.parent_id !== undefined && { parent_id: body.parent_id }),
        updated_at: new Date().toISOString(),
      };

      mockCategorias[index] = updatedCategoria;

      return apiResponses.success(updatedCategoria);
    });
  });

  // --- PATCH /api/v1/categorias/:id/... (cualquier patch parcial) ---
  mock.onPatch(/\/api\/v1\/categorias\/(\d+)/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/categorias\/(\d+)/);
      const catId = match ? parseInt(match[1], 10) : null;

      if (!catId) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      const body = JSON.parse(config.data);
      const index = mockCategorias.findIndex(c => c.id === catId);

      if (index === -1) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      const updatedCategoria: Categoria = {
        ...mockCategorias[index],
        ...body,
        updated_at: new Date().toISOString(),
      };

      mockCategorias[index] = updatedCategoria;

      return apiResponses.success(updatedCategoria);
    });
  });

  // --- DELETE /api/v1/categorias/:id ---
  mock.onDelete(/\/api\/v1\/categorias\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/categorias\/(\d+)/);
      const catId = match ? parseInt(match[1], 10) : null;

      if (!catId) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      // Verificar que no tenga hijos
      const hasChildren = mockCategorias.some(c => c.parent_id === catId);
      if (hasChildren) {
        return apiResponses.validationError(
          'No se puede eliminar una categoría con subcategorías. Primero elimine o reasigne las subcategorías.'
        );
      }

      const index = mockCategorias.findIndex(c => c.id === catId);

      if (index === -1) {
        return apiResponses.notFound('Categoría no encontrada');
      }

      // Soft delete
      mockCategorias[index] = {
        ...mockCategorias[index],
        deleted_at: new Date().toISOString(),
      };

      return apiResponses.noContent();
    });
  });
};

export default setupCategoryHandlers;
