import type MockAdapter from 'axios-mock-adapter';
import {
  MOCK_PRODUCTOS,
  MOCK_INGREDIENTES,
  MOCK_CATEGORIAS,
} from '../mockData';
import { apiResponses, withDelay, extractOffsetParams } from '../mockAdapter';
import type {
  Producto,
  ProductoRead,
  ProductoCreate,
  ProductoUpdate,
  Ingrediente,
  IngredienteCreate,
  IngredienteUpdate,
  Categoria,
} from '../../types';

// ============================================
// HANDLERS DE PRODUCTOS
// Endpoints:
// - GET    /api/v1/productos
// - GET    /api/v1/productos/:id
// - POST   /api/v1/productos
// - PUT    /api/v1/productos/:id
// - PATCH  /api/v1/productos/:id/disponibilidad
// - DELETE /api/v1/productos/:id
// - GET    /api/v1/ingredientes
// - POST   /api/v1/ingredientes
// - GET    /api/v1/ingredientes/:id
// - PUT    /api/v1/ingredientes/:id
// - DELETE /api/v1/ingredientes/:id
// ============================================

// Copia mutable para operaciones CRUD en mock
let mockProductos = [...MOCK_PRODUCTOS];
let mockIngredientes = [...MOCK_INGREDIENTES];

const toProductoRead = (p: Producto): ProductoRead => ({
  ...p,
  ingredientes: p.ingredientes.map(pi => pi.ingrediente!).filter(Boolean),
});

export const setupProductHandlers = (mock: MockAdapter) => {
  // --- GET /api/v1/productos ---
  mock.onGet('/api/v1/productos').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { offset, limit } = extractOffsetParams(params);

      // Aplicar filtros
      let filtered = [...mockProductos];

      // Filtro: categoría
      if (params.categoria) {
        const catId = parseInt(params.categoria, 10);
        filtered = filtered.filter(p => 
          p.categorias.some(c => c.id === catId || c.parent_id === catId)
        );
      }

      // Filtro: search (por nombre o descripción)
      if (params.search) {
        const searchTerm = (params.search as string).toLowerCase();
        filtered = filtered.filter(p =>
          p.nombre.toLowerCase().includes(searchTerm) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm))
        );
      }

      // Filtro: min_precio
      if (params.min_precio !== undefined && params.min_precio !== null) {
        const minPrice = parseFloat(params.min_precio);
        if (!isNaN(minPrice)) {
          filtered = filtered.filter(p => p.precio_base >= minPrice);
        }
      }

      // Filtro: max_precio
      if (params.max_precio !== undefined && params.max_precio !== null) {
        const maxPrice = parseFloat(params.max_precio);
        if (!isNaN(maxPrice)) {
          filtered = filtered.filter(p => p.precio_base <= maxPrice);
        }
      }

      // Filtro: disponible
      if (params.disponible !== undefined && params.disponible !== null) {
        const disponible = params.disponible === true || params.disponible === 'true';
        filtered = filtered.filter(p => p.disponible === disponible);
      }

      // Ordenar por id
      filtered.sort((a, b) => a.id - b.id);

      // Aplicar paginación offset-based
      const total = filtered.length;
      const items = filtered.slice(offset, offset + limit).map(toProductoRead);

      return apiResponses.success({
        items,
        total,
        offset,
        limit,
      });
    });
  });

  // --- GET /api/v1/productos/:id ---
  mock.onGet(/\/api\/v1\/productos\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/productos\/(\d+)/);
      const productId = match ? parseInt(match[1], 10) : null;

      if (!productId) {
        return apiResponses.notFound('Producto no encontrado');
      }

      const producto = mockProductos.find(p => p.id === productId);
      
      if (!producto) {
        return apiResponses.notFound('Producto no encontrado');
      }

      return apiResponses.success(toProductoRead(producto));
    });
  });

  // --- POST /api/v1/productos ---
  mock.onPost('/api/v1/productos').reply(async (config) => {
    return withDelay(async () => {
      const body: ProductoCreate = JSON.parse(config.data);

      // Validaciones básicas
      if (!body.nombre || body.nombre.trim().length === 0) {
        return apiResponses.validationError('El nombre es requerido', 'nombre');
      }
      if (body.precio_base === undefined || body.precio_base < 0) {
        return apiResponses.validationError('El precio debe ser un valor positivo', 'precio_base');
      }

      const newId = Math.max(...mockProductos.map(p => p.id), 0) + 1;

      const newProducto: Producto = {
        id: newId,
        nombre: body.nombre,
        descripcion: body.descripcion || '',
        precio_base: body.precio_base,
        imagenes_url: body.imagenes_url || [],
        stock_cantidad: body.stock_cantidad ?? 0,
        disponible: body.disponible ?? true,
        categorias: (body.categoria_ids || []).map(id => 
          MOCK_CATEGORIAS.find(c => c.id === id)
        ).filter(Boolean) as Categoria[],
        ingredientes: (body.ingredientes || []).map(pi => ({
          producto_id: newId,
          ingrediente_id: pi.ingrediente_id,
          es_removible: pi.es_removible,
          ingrediente: mockIngredientes.find(i => i.id === pi.ingrediente_id),
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockProductos.push(newProducto);

      return apiResponses.created(toProductoRead(newProducto));
    });
  });

  // --- PUT /api/v1/productos/:id ---
  mock.onPut(/\/api\/v1\/productos\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/productos\/(\d+)/);
      const productId = match ? parseInt(match[1], 10) : null;

      if (!productId) {
        return apiResponses.notFound('Producto no encontrado');
      }

      const body: ProductoUpdate = JSON.parse(config.data);
      const index = mockProductos.findIndex(p => p.id === productId);

      if (index === -1) {
        return apiResponses.notFound('Producto no encontrado');
      }

      const updatedProducto: Producto = {
        ...mockProductos[index],
        ...(body.nombre !== undefined && { nombre: body.nombre }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
        ...(body.precio_base !== undefined && { precio_base: body.precio_base }),
        ...(body.imagenes_url !== undefined && { imagenes_url: body.imagenes_url }),
        ...(body.stock_cantidad !== undefined && { stock_cantidad: body.stock_cantidad }),
        ...(body.disponible !== undefined && { disponible: body.disponible }),
        updated_at: new Date().toISOString(),
      };

      // Actualizar categorías si se proporcionaron
      if (body.categoria_ids) {
        updatedProducto.categorias = body.categoria_ids.map(id => 
          MOCK_CATEGORIAS.find(c => c.id === id)
        ).filter(Boolean) as Categoria[];
      }

      // Actualizar ingredientes si se proporcionaron
      if (body.ingredientes) {
        updatedProducto.ingredientes = body.ingredientes.map(pi => ({
          producto_id: productId,
          ingrediente_id: pi.ingrediente_id,
          es_removible: pi.es_removible,
          ingrediente: mockIngredientes.find(i => i.id === pi.ingrediente_id),
        }));
      }

      mockProductos[index] = updatedProducto;

      return apiResponses.success(toProductoRead(updatedProducto));
    });
  });

  // --- PATCH /api/v1/productos/:id/disponibilidad ---
  mock.onPatch(/\/api\/v1\/productos\/(\d+)\/disponibilidad/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/productos\/(\d+)\/disponibilidad/);
      const productId = match ? parseInt(match[1], 10) : null;

      if (!productId) {
        return apiResponses.notFound('Producto no encontrado');
      }

      const body = JSON.parse(config.data);
      const disponible = body.disponible ?? true;

      const index = mockProductos.findIndex(p => p.id === productId);

      if (index === -1) {
        return apiResponses.notFound('Producto no encontrado');
      }

      const updatedProducto: Producto = {
        ...mockProductos[index],
        disponible,
        updated_at: new Date().toISOString(),
      };

      mockProductos[index] = updatedProducto;

      return apiResponses.success(toProductoRead(updatedProducto));
    });
  });

  // --- DELETE /api/v1/productos/:id ---
  mock.onDelete(/\/api\/v1\/productos\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/productos\/(\d+)/);
      const productId = match ? parseInt(match[1], 10) : null;

      if (!productId) {
        return apiResponses.notFound('Producto no encontrado');
      }

      const index = mockProductos.findIndex(p => p.id === productId);

      if (index === -1) {
        return apiResponses.notFound('Producto no encontrado');
      }

      // Soft delete: marcar deleted_at
      mockProductos[index] = {
        ...mockProductos[index],
        disponible: false,
        deleted_at: new Date().toISOString(),
      };

      return apiResponses.noContent();
    });
  });

  // ============================================
  // INGREDIENTES
  // ============================================

  // --- GET /api/v1/ingredientes ---
  mock.onGet('/api/v1/ingredientes').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { offset, limit } = extractOffsetParams(params);

      let filtered = [...mockIngredientes];

      // Filtro por alergeno
      if (params.es_alergeno !== undefined && params.es_alergeno !== null) {
        const esAlergeno = params.es_alergeno === true || params.es_alergeno === 'true';
        filtered = filtered.filter(i => i.es_alergeno === esAlergeno);
      }

      const total = filtered.length;
      const items = filtered.slice(offset, offset + limit);

      return apiResponses.success({ items, total, offset, limit });
    });
  });

  // --- GET /api/v1/ingredientes/:id ---
  mock.onGet(/\/api\/v1\/ingredientes\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/ingredientes\/(\d+)/);
      const ingId = match ? parseInt(match[1], 10) : null;

      if (!ingId) {
        return apiResponses.notFound('Ingrediente no encontrado');
      }

      const ingrediente = mockIngredientes.find(i => i.id === ingId);
      
      if (!ingrediente) {
        return apiResponses.notFound('Ingrediente no encontrado');
      }

      return apiResponses.success(ingrediente);
    });
  });

  // --- POST /api/v1/ingredientes ---
  mock.onPost('/api/v1/ingredientes').reply(async (config) => {
    return withDelay(async () => {
      const body: IngredienteCreate = JSON.parse(config.data);

      if (!body.nombre || body.nombre.trim().length === 0) {
        return apiResponses.validationError('El nombre es requerido', 'nombre');
      }

      // Verificar duplicado
      if (mockIngredientes.some(i => i.nombre.toLowerCase() === body.nombre.toLowerCase())) {
        return apiResponses.conflict('Ya existe un ingrediente con ese nombre');
      }

      const newId = Math.max(...mockIngredientes.map(i => i.id), 0) + 1;

      const newIngrediente: Ingrediente = {
        id: newId,
        nombre: body.nombre,
        descripcion: body.descripcion || '',
        es_alergeno: body.es_alergeno ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockIngredientes.push(newIngrediente);

      return apiResponses.created(newIngrediente);
    });
  });

  // --- PUT /api/v1/ingredientes/:id ---
  mock.onPut(/\/api\/v1\/ingredientes\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/ingredientes\/(\d+)/);
      const ingId = match ? parseInt(match[1], 10) : null;

      if (!ingId) {
        return apiResponses.notFound('Ingrediente no encontrado');
      }

      const body: IngredienteUpdate = JSON.parse(config.data);
      const index = mockIngredientes.findIndex(i => i.id === ingId);

      if (index === -1) {
        return apiResponses.notFound('Ingrediente no encontrado');
      }

      const updatedIngrediente: Ingrediente = {
        ...mockIngredientes[index],
        ...(body.nombre !== undefined && { nombre: body.nombre }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
        ...(body.es_alergeno !== undefined && { es_alergeno: body.es_alergeno }),
        updated_at: new Date().toISOString(),
      };

      mockIngredientes[index] = updatedIngrediente;

      return apiResponses.success(updatedIngrediente);
    });
  });

  // --- DELETE /api/v1/ingredientes/:id ---
  mock.onDelete(/\/api\/v1\/ingredientes\/(\d+)$/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/ingredientes\/(\d+)/);
      const ingId = match ? parseInt(match[1], 10) : null;

      if (!ingId) {
        return apiResponses.notFound('Ingrediente no encontrado');
      }

      const index = mockIngredientes.findIndex(i => i.id === ingId);

      if (index === -1) {
        return apiResponses.notFound('Ingrediente no encontrado');
      }

      mockIngredientes.splice(index, 1);

      return apiResponses.noContent();
    });
  });
};

export default setupProductHandlers;
