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
// Endpoints:
// - POST /api/v1/auth/login
// - POST /api/v1/auth/register
// - POST /api/v1/auth/refresh
// - POST /api/v1/auth/logout
// - GET /api/v1/auth/me
// ============================================

// Almacenamiento en memoria para refresh tokens activos
const activeRefreshTokens = new Map<string, { userId: number; token: string }>();

export const setupAuthHandlers = (mock: MockAdapter) => {
  // --- POST /api/v1/auth/login ---
  mock.onPost('/api/v1/auth/login').reply(async (config) => {
    return withDelay(async () => {
      const body: LoginRequest = JSON.parse(config.data);
      const { email, password } = body;

      // Buscar usuario por email
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return apiResponses.unauthorized('Credenciales inválidas');
      }

      // Validación simple de contraseña (en mock, aceptamos cualquier contraseña >= 8 chars)
      // Para usuarios mock, la contraseña "mockpass123" funciona siempre
      if (password.length < 8 && password !== 'mockpass123') {
        return apiResponses.validationError('La contraseña debe tener al menos 8 caracteres');
      }

      // Generar tokens
      const accessToken = generateFakeJWT(user.id, user.roles, 30);
      const refreshToken = generateRefreshToken();

      // Guardar refresh token
      activeRefreshTokens.set(refreshToken, { userId: user.id, token: refreshToken });

      const response: TokenResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 1800, // 30 minutos
        user,
      };

      return apiResponses.success(response);
    });
  });

  // --- POST /api/v1/auth/register ---
  mock.onPost('/api/v1/auth/register').reply(async (config) => {
    return withDelay(async () => {
      const body: RegisterRequest = JSON.parse(config.data);
      const { email, password, nombre, apellido } = body;

      // Validaciones
      if (!email || !email.includes('@')) {
        return apiResponses.validationError('Email inválido', 'email');
      }
      if (!password || password.length < 8) {
        return apiResponses.validationError('La contraseña debe tener al menos 8 caracteres', 'password');
      }
      if (!nombre || nombre.length < 2) {
        return apiResponses.validationError('El nombre debe tener al menos 2 caracteres', 'nombre');
      }

      // Verificar email duplicado
      if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return apiResponses.conflict('El email ya se encuentra registrado');
      }

      // Crear nuevo usuario (simulado)
      const newUser: User = {
        id: MOCK_USERS.length + 1,
        nombre,
        apellido: apellido || '',
        email,
        telefono: body.telefono,
        roles: ['CLIENT'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Generar tokens
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

  // --- POST /api/v1/auth/refresh ---
  mock.onPost('/api/v1/auth/refresh').reply(async (config) => {
    return withDelay(async () => {
      const body: RefreshTokenRequest = JSON.parse(config.data);
      const { refresh_token } = body;

      const tokenData = activeRefreshTokens.get(refresh_token);
      
      if (!tokenData) {
        return apiResponses.unauthorized('Refresh token inválido o expirado');
      }

      // Obtener usuario
      const user = MOCK_USERS.find(u => u.id === tokenData.userId);
      if (!user) {
        return apiResponses.unauthorized('Usuario no encontrado');
      }

      // Rotar tokens: invalidar el viejo, generar nuevos
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

  // --- POST /api/v1/auth/logout ---
  mock.onPost('/api/v1/auth/logout').reply(async (config) => {
    return withDelay(async () => {
      try {
        const body = config.data ? JSON.parse(config.data) : {};
        const { refresh_token } = body;

        if (refresh_token) {
          activeRefreshTokens.delete(refresh_token);
        }

        return apiResponses.noContent();
      } catch {
        // Si no hay body, simplemente devolvemos 204
        return apiResponses.noContent();
      }
    });
  });

  // --- GET /api/v1/auth/me ---
  mock.onGet('/api/v1/auth/me').reply(async (config) => {
    return withDelay(async () => {
      // Extraer token del header Authorization
      const authHeader = config.headers?.Authorization || config.headers?.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return apiResponses.unauthorized('Token no proporcionado');
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Decodificar token mock para obtener userId
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

  // --- GET /api/v1/admin/usuarios (Admin only) ---
  mock.onGet('/api/v1/admin/usuarios').reply(async (config) => {
    return withDelay(async () => {
      const params = config.params || {};
      const { page, size } = extractPaginationParams(params);
      
      return apiResponses.paginated(MOCK_USERS, page, size);
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
      const roles: UserRole[] = body.roles || body.rol ? [body.rol] : [];

      const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return apiResponses.notFound('Usuario no encontrado');
      }

      // Validar roles
      const validRoles: UserRole[] = ['ADMIN', 'STOCK', 'PEDIDOS', 'CLIENT'];
      const invalidRoles = roles.filter(r => !validRoles.includes(r));
      if (invalidRoles.length > 0) {
        return apiResponses.validationError(`Roles inválidos: ${invalidRoles.join(', ')}`);
      }

      // Simular actualización (no modificamos el array original)
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
