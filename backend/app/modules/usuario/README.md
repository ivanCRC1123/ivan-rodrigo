# Módulo de Usuarios y Roles (RBAC)

Este módulo implementa un sistema completo de gestión de usuarios y asignación de roles (Role-Based Access Control) siguiendo el patrón Repository/Service Layer.

## Estructura

```
app/modules/usuario/
├── models.py          # Modelos SQLModel (Usuario, Rol, UsuarioRol)
├── schemas.py         # Esquemas Pydantic para validación
├── repository.py      # Capa de acceso a datos
├── service.py         # Lógica de negocio
├── router.py          # Endpoints de API
└── __init__.py        # Exportaciones del módulo
```

## Características

### ✅ Modelos

- **Usuario**: Gestión de usuarios con contraseña hasheada
  - Campos: `id`, `email`, `nombre`, `apellido`, `password_hash`, `activo`
  - Soft delete con `deleted_at: TIMESTAMPTZ`
  - Métodos: `is_deleted()`, `is_active()`

- **Rol**: Definición de roles para RBAC
  - Campos: `id`, `nombre`, `codigo` (único), `descripcion`
  - Soft delete con `deleted_at: TIMESTAMPTZ`
  - Métodos: `is_deleted()`

- **UsuarioRol**: Tabla intermedia para relación N:N
  - Relación Many-to-Many entre Usuario y Rol
  - Auditoría con `created_at`

### 🔐 Seguridad

- **Hashing de contraseñas**: PBKDF2-SHA256 con salt de 16 bytes
- **Nunca se devuelven contraseñas**: Los esquemas de lectura excluyen `password_hash`
- **Validación de entrada**: Schemas Pydantic en todos los endpoints

### 🗂️ Capa de Repositorio

Cada repositorio implementa CRUD completo con soporte para soft delete:

#### UsuarioRepository
- `get_by_id()`, `get_by_email()`, `get_all()`
- `create()`, `update()`, `soft_delete()`, `restore()`, `hard_delete()`
- `exists_email()` - Validación de unicidad

#### RolRepository
- `get_by_id()`, `get_by_codigo()`, `get_all()`
- `create()`, `update()`, `soft_delete()`, `restore()`, `hard_delete()`
- `exists_codigo()` - Validación de unicidad

#### UsuarioRolRepository
- `asignar_rol()` - Asigna un rol a un usuario
- `desasignar_rol()` - Desasigna un rol
- `get_roles_by_usuario()` - Obtiene todos los roles de un usuario
- `usuario_tiene_rol()` - Verifica si un usuario tiene un rol
- `usuario_tiene_codigo_rol()` - Verifica por código de rol

### 🧠 Lógica de Negocio (Services)

#### UsuarioService
```python
crear_usuario(data: UsuarioCreate) -> Usuario
obtener_usuario_por_id(usuario_id: int) -> Usuario
obtener_usuario_por_email(email: str) -> Usuario
listar_usuarios(skip: int, limit: int) -> list[Usuario]
actualizar_usuario(usuario_id: int, data: UsuarioUpdate) -> Usuario
cambiar_contrasena(usuario_id: int, pwd_actual: str, pwd_nueva: str) -> Usuario
eliminar_usuario(usuario_id: int, hard_delete: bool = False) -> None
restaurar_usuario(usuario_id: int) -> Usuario
verificar_contrasena(email: str, password: str) -> Usuario | None  # Para login
```

#### RolService
```python
crear_rol(data: RolCreate) -> Rol
obtener_rol_por_id(rol_id: int) -> Rol
obtener_rol_por_codigo(codigo: str) -> Rol
listar_roles(skip: int, limit: int) -> list[Rol]
actualizar_rol(rol_id: int, data: RolUpdate) -> Rol
eliminar_rol(rol_id: int, hard_delete: bool = False) -> None
restaurar_rol(rol_id: int) -> Rol
```

#### UsuarioRolService
```python
asignar_rol_a_usuario(usuario_id: int, rol_id: int) -> UsuarioRol
desasignar_rol_de_usuario(usuario_id: int, rol_id: int) -> None
obtener_roles_usuario(usuario_id: int) -> list[Rol]
usuario_tiene_rol(usuario_id: int, rol_id: int) -> bool
usuario_tiene_codigo_rol(usuario_id: int, codigo_rol: str) -> bool
```

## Endpoints de API

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/usuarios` | Lista usuarios (paginado) |
| GET | `/api/v1/usuarios/{id}` | Obtiene un usuario |
| POST | `/api/v1/usuarios` | Crea un usuario |
| PUT | `/api/v1/usuarios/{id}` | Actualiza un usuario |
| DELETE | `/api/v1/usuarios/{id}` | Elimina un usuario (soft delete) |
| POST | `/api/v1/usuarios/{id}/cambiar-contrasena` | Cambia contraseña |
| POST | `/api/v1/usuarios/{id}/restaurar` | Restaura usuario eliminado |

### Roles
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/roles` | Lista roles |
| GET | `/api/v1/roles/{id}` | Obtiene un rol |
| POST | `/api/v1/roles` | Crea un rol |
| PUT | `/api/v1/roles/{id}` | Actualiza un rol |
| DELETE | `/api/v1/roles/{id}` | Elimina un rol (soft delete) |
| POST | `/api/v1/roles/{id}/restaurar` | Restaura rol eliminado |

### Asignación de Roles
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/usuarios/{usuario_id}/roles/{rol_id}` | Asigna rol a usuario |
| DELETE | `/api/v1/usuarios/{usuario_id}/roles/{rol_id}` | Desasigna rol |
| GET | `/api/v1/usuarios/{usuario_id}/roles` | Lista roles del usuario |
| GET | `/api/v1/usuarios/{usuario_id}/tiene-rol/{rol_id}` | Verifica si tiene rol |

## Ejemplos de Uso

### Crear Usuario
```bash
curl -X POST "http://localhost:8000/api/v1/usuarios" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "password": "segura123!",
    "activo": true
  }'
```

### Crear Rol
```bash
curl -X POST "http://localhost:8000/api/v1/roles" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Administrador",
    "codigo": "ADMIN",
    "descripcion": "Acceso total al sistema"
  }'
```

### Asignar Rol a Usuario
```bash
curl -X POST "http://localhost:8000/api/v1/usuarios/1/roles/1"
```

### Cambiar Contraseña
```bash
curl -X POST "http://localhost:8000/api/v1/usuarios/1/cambiar-contrasena" \
  -H "Content-Type: application/json" \
  -d '{
    "password_actual": "segura123!",
    "password_nueva": "nueva_segura456!",
    "password_confirmacion": "nueva_segura456!"
  }'
```

## Soft Delete vs Hard Delete

### Soft Delete (por defecto)
```python
# El usuario se marca como eliminado pero los datos permanecen
DELETE /api/v1/usuarios/1
# Restaurar
POST /api/v1/usuarios/1/restaurar
```

### Hard Delete (permanente)
```bash
# Elimina permanentemente de la base de datos
DELETE /api/v1/usuarios/1?hard_delete=true
```

## Integración con el Proyecto

El módulo está automáticamente incluido en `app/main.py`:

```python
from app.modules.usuario.router import router as usuario_router
app.include_router(usuario_router)
```

Las tablas se crean automáticamente al iniciar la aplicación gracias a:
```python
SQLModel.metadata.create_all(engine)
```

## Validaciones y Errores

### Validaciones Implementadas
- Email único (valida durante creación y actualización)
- Código de rol único
- Contraseña y confirmación deben coincidir
- Password_hash no se devuelve nunca en respuestas
- Usuarios eliminados no aparecen en listados por defecto

### Códigos de Error HTTP
- `400 Bad Request`: Validación fallida, email duplicado, código duplicado
- `404 Not Found`: Recurso no encontrado
- `201 Created`: Creación exitosa
- `204 No Content`: Eliminación exitosa

## Seguridad

### Contraseñas
- Se hashean con PBKDF2-SHA256 (100,000 iteraciones)
- Nunca se devuelven en respuestas de API
- Se validan en cambios de contraseña

### Datos Sensibles
- El campo `password_hash` está excluido de todos los schemas de lectura
- Logs nunca incluyen contraseñas

### Soft Delete
- Los datos nunca se pierden accidentalmente
- Los registros eliminados no aparecen en búsquedas por defecto
- Se puede restaurar con un simple endpoint

## Próximos Pasos Recomendados

1. Implementar autenticación JWT
2. Agregar middleware de autorización basado en roles
3. Crear permisos granulares (más allá de roles simples)
4. Implementar auditoría detallada de acciones
5. Agregar rate limiting
6. Implementar 2FA (autenticación de dos factores)
