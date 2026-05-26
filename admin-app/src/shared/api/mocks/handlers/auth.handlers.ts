// ============================================
// EXPORTA TODOS LOS HANDLERS (admin-app)
// ============================================

import type MockAdapter from 'axios-mock-adapter';
import {
  MOCK_USERS,
  generateFakeJWT,
  generateRefreshToken,
} from '../mockData';
import { apiResponses, withDelay, extractPaginationParams } from '../mockAdapter';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  RefreshTokenRequest,
  UserRole,
} from '../../types';

// ============================================
// HANDLERS DE AUTENTICACIÓN
// ============================================

const activeRefreshTokens = new Map<string, { userId: number; token: string }>();

export const setupAuthHandlers = (mock: MockAdapter) => {
  mock.onPost('/api/v1/auth/login').reply(async (config) => {
    return withDelay(async () => {
      const body: LoginRequest = JSON.parse(config.data);
      const { email, password } = body;

      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return apiResponses.unauthorized('Credenciales inválidas');
      }

      if (password.length < 8 && password !== 'mockpass123') {
        return apiResponses.validationError('La contraseña debe tener al menos 8 caracteres');
      }

      const accessToken = generateFakeJWT(user.id, user.roles, 30);
      const refreshToken = generateRefreshToken();

      activeRefreshTokens.set(refreshToken, { userId: user.id, token: refreshToken });

      const response: TokenResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 1800,
        user,
      };

      return apiResponses.success(response);
    });
  });

  mock.onPost('/api/v1/auth/register').reply(async (config) => {
    return withDelay(async () => {
      const body: RegisterRequest = JSON.parse(config.data);
      const { email, password, nombre } = body;

      if (!email || !email.includes('@')) {
        return apiResponses.validationError('Email inválido', 'email');
      }
      if (!password || password.length < 8) {
        return apiResponses.validationError('La contraseña debe tener al menos 8 caracteres', 'password');
      }
      if (!nombre || nombre.length < 2) {
        return apiResponses.validationError('El nombre debe tener al menos 2 caracteres', 'nombre');
      }

      if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return apiResponses.conflict('El email ya se encuentra registrado');
      }

      const newUser: User = {
        id: MOCK_USERS.length + 1,
        nombre,
        apellido: body.apellido || '',
        email,
        telefono: body.telefono,
        roles: ['CLIENT'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const accessToken = generateFakeJWT(newUser.id, newUser.roles, 30);
      const refreshToken = generateRefreshToken();

      activeRefreshTokens.set(refreshToken, { userId: newUser.id, token: refreshToken });

      const response: TokenResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 1800,
        user: newUser,
      };

      return apiResponses.created(response);
    });
  });

  mock.onPost('/api/v1/auth/refresh').reply(async (config) => {
    return withDelay(async () => {
      const body: RefreshTokenRequest = JSON.parse(config.data);
      const { refresh_token } = body;

      const tokenData = activeRefreshTokens.get(refresh_token);
      
      if (!tokenData) {
        return apiResponses.unauthorized('Refresh token inválido o expirado');
      }

      const user = MOCK_USERS.find(u => u.id === tokenData.userId);
      if (!user) {
        return apiResponses.unauthorized('Usuario no encontrado');
      }

      activeRefreshTokens.delete(refresh_token);

      const newAccessToken = generateFakeJWT(user.id, user.roles, 30);
      const newRefreshToken = generateRefreshToken();

      activeRefreshTokens.set(newRefreshToken, { userId: user.id, token: newRefreshToken });

      const response: TokenResponse = {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'bearer',
        expires_in: 1800,
        user,
      };

      return apiResponses.success(response);
    });
  });

  mock.onPost('/api/v1/auth/logout').reply(async () => {
    return withDelay(async () => {
      return apiResponses.noContent();
    });
  });

  mock.onGet('/api/v1/auth/me').reply(async (config) => {
    return withDelay(async () => {
      const authHeader = config.headers?.Authorization || config.headers?.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return apiResponses.unauthorized('Token no proporcionado');
      }

      const token = authHeader.replace('Bearer ', '');
      
      try {
        const parts = token.split('.');
        if (parts.length < 2) {
          return apiResponses.unauthorized('Token inválido');
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const userId = payload.user_id || payload.sub;
        
        const user = MOCK_USERS.find(u => u.id === userId);
        
        if (!user) {
          return apiResponses.unauthorized('Usuario no encontrado');
        }

        return apiResponses.success(user);
      } catch {
        return apiResponses.unauthorized('Token inválido');
      }
    });
  });

  mock.onGet('/api/v1/admin/usuarios').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { page, size } = extractPaginationParams(params);
      return apiResponses.paginated(MOCK_USERS, page, size);
    });
  });

  mock.onPut(/\/api\/v1\/admin\/usuarios\/(\d+)\/rol/).reply(async (config) => {
    return withDelay(async () => {
      const url = config.url || '';
      const match = url.match(/\/api\/v1\/admin\/usuarios\/(\d+)\/rol/);
      const userId = match ? parseInt(match[1], 10) : null;
      
      if (!userId) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      const body = JSON.parse(config.data);
      const roles: UserRole[] = body.roles || body.rol ? [body.rol] : [];

      const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      const validRoles: UserRole[] = ['ADMIN', 'STOCK', 'PEDIDOS', 'CLIENT'];
      const invalidRoles = roles.filter(r => !validRoles.includes(r));
      if (invalidRoles.length > 0) {
        return apiResponses.validationError(`Roles inválidos: ${invalidRoles.join(', ')}`);
      }

      const updatedUser: User = {
        ...MOCK_USERS[userIndex],
        roles,
        updated_at: new Date().toISOString(),
      };

      return apiResponses.success(updatedUser);
    });
  });
};

export default setupAuthHandlers;
