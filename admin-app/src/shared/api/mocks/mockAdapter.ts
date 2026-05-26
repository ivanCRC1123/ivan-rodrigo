import type { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

// ============================================
// CONFIGURACIÓN DEL MOCK ADAPTER
// ============================================

/**
 * Delay aleatorio para simular latencia de red (200-800ms)
 */
export const randomDelay = (min = 200, max = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Crea y configura el mock adapter para una instancia de axios
 */
export const createMockAdapter = (axiosInstance: AxiosInstance): MockAdapter => {
  const mock = new MockAdapter(axiosInstance, { 
    delayResponse: 0  // Usamos delay manual para control más fino
  });
  
  // Configuración global: reset mocks entre pruebas si es necesario
  console.log('[Mock Adapter] Mock mode activado - las peticiones serán interceptadas');
  
  return mock;
};

/**
 * Wrapper para handlers con delay automático
 */
export const withDelay = async <T>(
  handler: () => Promise<[number, T] | [number]>
): Promise<[number, T] | [number]> => {
  await randomDelay();
  return handler();
};

/**
 * Respuestas comunes de API
 */
export const apiResponses = {
  success: <T>(data: T, status = 200): [number, T] => [status, data],
  
  created: <T>(data: T): [number, T] => [201, data],
  
  noContent: (): [number] => [204],
  
  notFound: (detail = 'Recurso no encontrado'): [number, { detail: string; code: string }] => 
    [404, { detail, code: 'NOT_FOUND' }],
  
  unauthorized: (detail = 'Autenticación requerida'): [number, { detail: string; code: string }] => 
    [401, { detail, code: 'UNAUTHORIZED' }],
  
  forbidden: (detail = 'Permisos insuficientes'): [number, { detail: string; code: string }] => 
    [403, { detail, code: 'FORBIDDEN' }],
  
  validationError: (detail = 'Error de validación', field?: string): [number, { detail: string; code: string; field?: string }] => 
    [422, { detail, code: 'VALIDATION_ERROR', field }],
  
  conflict: (detail = 'Conflicto con recurso existente'): [number, { detail: string; code: string }] => 
    [409, { detail, code: 'CONFLICT' }],
  
  paginated: <T>(
    items: T[], 
    page: number, 
    size: number,
    total?: number
  ): [number, { items: T[]; total: number; page: number; size: number; pages: number }] => {
    const actualTotal = total ?? items.length;
    const start = (page - 1) * size;
    const paginatedItems = items.slice(start, start + size);
    const pages = Math.ceil(actualTotal / size);
    
    return [200, {
      items: paginatedItems,
      total: actualTotal,
      page,
      size,
      pages
    }];
  },
};

/**
 * Extrae parámetros de paginación de la URL
 */
export const extractPaginationParams = (
  params: Record<string, string | number | undefined>
): { page: number; size: number } => {
  const page = typeof params.page === 'number' ? params.page : 
               typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const size = typeof params.size === 'number' ? params.size : 
               typeof params.size === 'string' ? parseInt(params.size, 10) : 20;
  
  return { 
    page: Math.max(1, page), 
    size: Math.min(100, Math.max(1, size)) 
  };
};

/**
 * Extrae parámetros de offset/limit (estilo FastAPI)
 */
export const extractOffsetParams = (
  params: Record<string, string | number | undefined>
): { offset: number; limit: number } => {
  const offset = typeof params.offset === 'number' ? params.offset : 
                 typeof params.offset === 'string' ? parseInt(params.offset, 10) : 0;
  const limit = typeof params.limit === 'number' ? params.limit : 
                typeof params.limit === 'string' ? parseInt(params.limit, 10) : 100;
  
  return { 
    offset: Math.max(0, offset), 
    limit: Math.min(100, Math.max(1, limit)) 
  };
};

export default createMockAdapter;
