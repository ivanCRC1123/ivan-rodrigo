// ============================================
// ADAPTER PROVIDER
// 
// Selecciona entre modo mock y modo real
// según la variable de entorno o configuración.
// ============================================

import type { AxiosInstance } from 'axios';
import axios from 'axios';
import apiClient from '../apiClient';
import { initializeMocks } from './mocks';

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Variable de entorno para habilitar el modo mock.
 * Valores posibles: 'true', '1', 'yes' → modo mock activado
 */
const MOCK_ENABLED_VAR = 'VITE_MOCK_ENABLED';

/**
 * Valor por defecto: false (modo real)
 * Para desarrollo local sin backend, establecer a true.
 */
const DEFAULT_MOCK_ENABLED = false;

// ============================================
// LECTURA DE CONFIGURACIÓN
// ============================================

/**
 * Lee la variable de entorno y determina si el modo mock está activado.
 */
const isMockEnabled = (): boolean => {
  try {
    // En Vite, las variables de entorno están en import.meta.env
    const env = (import.meta as any).env;
    if (env && env[MOCK_ENABLED_VAR]) {
      const value = String(env[MOCK_ENABLED_VAR]).toLowerCase();
      return value === 'true' || value === '1' || value === 'yes' || value === 'on';
    }
  } catch {
    // Silenciosamente usar valor por defecto
  }

  return DEFAULT_MOCK_ENABLED;
};

/**
 * Estado actual del modo mock
 */
export const MOCK_ENABLED = isMockEnabled();

// ============================================
// INICIALIZACIÓN DEL ADAPTER
// ============================================

let mockAdapter: any = null;
let axiosInstance: AxiosInstance = apiClient;

/**
 * Inicializa el adapter según el modo configurado.
 * Esta función se llama automáticamente al importar el módulo.
 */
const initializeAdapter = (): void => {
  if (MOCK_ENABLED) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    🎭 MODO MOCK ACTIVADO                       ║
╠═══════════════════════════════════════════════════════════════╣
║  Las peticiones API serán interceptadas por el mock adapter.  ║
║  Para desactivar: establece ${MOCK_ENABLED_VAR}=false        ║
║  en tu archivo .env o variables de entorno.                    ║
╚═══════════════════════════════════════════════════════════════╝
`);

    // Inicializar mocks en la instancia de axios
    mockAdapter = initializeMocks(apiClient);
    axiosInstance = apiClient;
  } else {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    🌐 MODO REAL ACTIVADO                        ║
╠═══════════════════════════════════════════════════════════════╣
║  Las peticiones API se enviarán al backend real.              ║
║  Asegúrate de que el backend esté corriendo en:               ║
║  ${apiClient.defaults.baseURL}                                 ║
╚═══════════════════════════════════════════════════════════════╝
`);
    axiosInstance = apiClient;
  }
};

// Inicializar automáticamente
initializeAdapter();

// ============================================
// API PÚBLICA
// ============================================

/**
 * Obtiene la instancia de axios configurada (mock o real).
 */
export const getApiClient = (): AxiosInstance => {
  return axiosInstance;
};

/**
 * Habilita o deshabilita el modo mock en tiempo de ejecución.
 * Útil para testing o desarrollo.
 * 
 * @param enabled - true para habilitar mock, false para modo real
 */
export const setMockMode = (enabled: boolean): void => {
  if (enabled === MOCK_ENABLED) {
    console.log(`[Adapter] Modo mock ya está ${enabled ? 'activado' : 'desactivado'}`);
    return;
  }

  if (enabled) {
    console.log('[Adapter] Activando modo mock...');
    mockAdapter = initializeMocks(apiClient);
    (window as any).MOCK_ENABLED = true;
  } else {
    console.log('[Adapter] Desactivando modo mock, restaurando conexiones reales...');
    if (mockAdapter) {
      mockAdapter.restore();
      mockAdapter = null;
    }
    (window as any).MOCK_ENABLED = false;
  }

  console.log(`[Adapter] Modo mock: ${enabled ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`);
};

/**
 * Verifica si el modo mock está activado.
 */
export const isMockMode = (): boolean => {
  return MOCK_ENABLED || !!(window as any).MOCK_ENABLED;
};

// ============================================
// TOGGLE MANUAL (para consola del navegador)
// ============================================

// Exponer funciones globalmente para facilitar debugging
if (typeof window !== 'undefined') {
  const win = window as any;
  
  win.__api__ = {
    /** Alternar modo mock */
    toggleMock: () => {
      const newState = !isMockMode();
      setMockMode(newState);
      return newState;
    },
    
    /** Ver estado actual */
    isMockEnabled: () => isMockMode(),
    
    /** Obtener URL base */
    getBaseURL: () => apiClient.defaults.baseURL,
    
    /** Credenciales de prueba */
    testCredentials: {
      admin: { email: 'admin@foodstore.com', password: 'mockpass123', role: 'ADMIN' },
      client: { email: 'juan.perez@example.com', password: 'mockpass123', role: 'CLIENT' },
      stock: { email: 'stock@foodstore.com', password: 'mockpass123', role: 'STOCK' },
      pedidos: { email: 'pedidos@foodstore.com', password: 'mockpass123', role: 'PEDIDOS' },
    },
  };

  console.log(`
💡 Tipos de consola disponibles:
   __api__.toggleMock()     → Alternar modo mock
   __api__.isMockEnabled()  → Ver estado
   __api__.getBaseURL()     → Ver URL del backend
   __api__.testCredentials  → Credenciales de prueba
`);
}

// Exportar la instancia por defecto
export default axiosInstance;
