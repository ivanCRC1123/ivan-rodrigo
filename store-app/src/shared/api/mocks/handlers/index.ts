// ============================================
// EXPORTA TODOS LOS HANDLERS
// ============================================

export { default as setupAuthHandlers } from './auth.handlers';
export { default as setupProductHandlers } from './product.handlers';
export { default as setupCategoryHandlers } from './category.handlers';
export { default as setupOrderHandlers } from './order.handlers';
export { default as setupPaymentHandlers } from './payment.handlers';
export { default as setupAddressHandlers } from './address.handlers';
export { default as setupAdminHandlers } from './admin.handlers';

import type MockAdapter from 'axios-mock-adapter';
import {
  setupAuthHandlers,
  setupProductHandlers,
  setupCategoryHandlers,
  setupOrderHandlers,
  setupPaymentHandlers,
  setupAddressHandlers,
  setupAdminHandlers,
} from './index';

/**
 * Configura TODOS los handlers en el mock adapter
 */
export const setupAllHandlers = (mock: MockAdapter): void => {
  setupAuthHandlers(mock);
  setupProductHandlers(mock);
  setupCategoryHandlers(mock);
  setupOrderHandlers(mock);
  setupPaymentHandlers(mock);
  setupAddressHandlers(mock);
  setupAdminHandlers(mock);

  // Handler catch-all para rutas no mockeadas (devuelve 404 o pasa al real)
  mock.onAny().passThrough();
};

export default setupAllHandlers;
