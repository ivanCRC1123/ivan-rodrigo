# Quick Reference - Módulo de Usuarios y Roles

## 📌 Importaciones Rápidas

```python
# Modelos
from app.modules.usuario.models import Usuario, Rol, UsuarioRol

# Servicios
from app.modules.usuario.service import UsuarioService, RolService, UsuarioRolService

# Schemas
from app.modules.usuario.schemas import (
    UsuarioCreate, UsuarioRead, UsuarioUpdate,
    RolCreate, RolRead, RolUpdate
)

# Router (ya está incluido en main.py)
from app.modules.usuario.router import router
```

## 🚀 Casos de Uso Comunes

### 1. Crear Usuario (en servicio)
```python
from app.modules.usuario.service import UsuarioService
from app.modules.usuario.schemas import UsuarioCreate

service = UsuarioService(session)
usuario = service.crear_usuario(
    UsuarioCreate(
        email="user@example.com",
        nombre="Juan",
        apellido="Pérez",
        password="segura123!"
    )
)
# Contraseña se hashea automáticamente con PBKDF2-SHA256
```

### 2. Verificar Contraseña (Login)
```python
usuario = service.verificar_contrasena(
    email="user@example.com",
    password="segura123!"
)
if usuario:
    print(f"Login exitoso: {usuario.email}")
else:
    print("Credenciales inválidas")
```

### 3. Asignar Rol a Usuario
```python
from app.modules.usuario.service import UsuarioRolService

service = UsuarioRolService(session)
service.asignar_rol_a_usuario(usuario_id=1, rol_id=1)
```

### 4. Verificar Si Usuario Tiene Rol
```python
tiene_rol = service.usuario_tiene_codigo_rol(
    usuario_id=1,
    codigo_rol="ADMIN"
)
```

### 5. Cambiar Contraseña
```python
usuario = service.cambiar_contrasena(
    usuario_id=1,
    password_actual="segura123!",
    password_nueva="nueva_segura456!"
)
```

### 6. Soft Delete (Lógico)
```python
service.eliminar_usuario(usuario_id=1)  # Por defecto soft delete
```

### 7. Restaurar Usuario Eliminado
```python
usuario = service.restaurar_usuario(usuario_id=1)
```

### 8. Hard Delete (Permanente)
```python
service.eliminar_usuario(usuario_id=1, hard_delete=True)
```

## 📊 Relaciones N:N

### Obtener Roles de Usuario
```python
from app.modules.usuario.repository import UsuarioRolRepository

repo = UsuarioRolRepository(session)
roles = repo.get_roles_by_usuario(usuario_id=1)

# Acceder a propiedades del rol
for rol in roles:
    print(f"ID: {rol.id}, Nombre: {rol.nombre}, Código: {rol.codigo}")
```

### Listar Usuarios por Rol
```python
# Opción: Usar query directa
from sqlmodel import select, Session
from app.modules.usuario.models import Usuario, UsuarioRol

query = select(Usuario).join(UsuarioRol).where(
    UsuarioRol.rol_id == 1,
    Usuario.deleted_at.is_(None)
)
usuarios = session.exec(query).all()
```

## 🔐 Seguridad - Notas Importantes

### Password Hashing
- **Algoritmo**: PBKDF2-SHA256
- **Iteraciones**: 100,000
- **Salt**: 16 bytes aleatorios
- **Formato**: `{salt}${hash}` (hex-encoded)

```python
# En service.py
password_hash = UsuarioService._hash_password("mi_password")
# "a1b2c3d4e5f6...${hash_very_long}..."

# Verificar
is_valid = UsuarioService._verify_password("mi_password", password_hash)
```

### Password nunca se devuelve
```python
# ❌ NUNCA haces esto:
usuario.password_hash  # ← Campo excluido de READ schemas

# ✅ Las respuestas API nunca incluyen:
# {
#   "id": 1,
#   "email": "user@example.com",
#   "nombre": "Juan",
#   "apellido": "Pérez",
#   "activo": true,
#   "created_at": "2024-05-25T12:34:56",
#   "updated_at": "2024-05-25T12:34:56",
#   "deleted_at": null,
#   "roles": [{...}]
# }
```

## 📝 Validaciones Automáticas

```python
# Email único
if service.usuario_repo.exists_email("duplicado@example.com"):
    raise ValueError("Email ya registrado")

# Código de rol único
if service.rol_repo.exists_codigo("ADMIN"):
    raise ValueError("Código ya existe")

# Rol ya asignado
try:
    service.asignar_rol_a_usuario(1, 1)
except ValueError as e:
    print(e)  # "El usuario 1 ya tiene el rol 1"
```

## 🔗 Soft Delete - Comportamiento Automático

```python
# Por defecto, siempre filtra registros eliminados
usuarios = service.listar_usuarios()
# SELECT * FROM usuario WHERE deleted_at IS NULL

# Para incluir eliminados:
from app.modules.usuario.repository import UsuarioRepository
repo = UsuarioRepository(session)
usuario = repo.get_by_id(1, include_deleted=True)
```

## 📡 Endpoints Más Usados

```bash
# Crear usuario
curl -X POST http://localhost:8000/api/v1/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "password": "segura123!"
  }'

# Crear rol
curl -X POST http://localhost:8000/api/v1/roles \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Administrador",
    "codigo": "ADMIN",
    "descripcion": "Acceso total"
  }'

# Asignar rol
curl -X POST http://localhost:8000/api/v1/usuarios/1/roles/1

# Cambiar contraseña
curl -X POST http://localhost:8000/api/v1/usuarios/1/cambiar-contrasena \
  -H "Content-Type: application/json" \
  -d '{
    "password_actual": "segura123!",
    "password_nueva": "nueva456!",
    "password_confirmacion": "nueva456!"
  }'

# Verificar si tiene rol
curl http://localhost:8000/api/v1/usuarios/1/tiene-rol/1
```

## 🏗️ Estructura de Servicios

```
UsuarioService(session)
├── crear_usuario(data)
├── obtener_usuario_por_id(usuario_id)
├── obtener_usuario_por_email(email)
├── listar_usuarios(skip, limit)
├── actualizar_usuario(usuario_id, data)
├── cambiar_contrasena(usuario_id, pwd_actual, pwd_nueva)
├── eliminar_usuario(usuario_id, hard_delete=False)
├── restaurar_usuario(usuario_id)
└── verificar_contrasena(email, password)  ← Para login

RolService(session)
├── crear_rol(data)
├── obtener_rol_por_id(rol_id)
├── obtener_rol_por_codigo(codigo)
├── listar_roles(skip, limit)
├── actualizar_rol(rol_id, data)
├── eliminar_rol(rol_id, hard_delete=False)
└── restaurar_rol(rol_id)

UsuarioRolService(session)
├── asignar_rol_a_usuario(usuario_id, rol_id)
├── desasignar_rol_de_usuario(usuario_id, rol_id)
├── obtener_roles_usuario(usuario_id)
├── usuario_tiene_rol(usuario_id, rol_id)
└── usuario_tiene_codigo_rol(usuario_id, codigo_rol)
```

## 🐛 Debugging Útil

```python
# Ver usuario con roles (desde servicio o repositorio)
usuario = service.obtener_usuario_por_id(1)
print(usuario.roles)  # Lista de Rol objects

# Ver todos los detalles de un usuario
print(f"Email: {usuario.email}")
print(f"Activo: {usuario.activo}")
print(f"Eliminado: {usuario.is_deleted()}")
print(f"Activo Total: {usuario.is_active()}")  # activo AND not deleted
print(f"Roles: {[r.codigo for r in usuario.roles]}")

# Verificar que la contraseña está hasheada
print(usuario.password_hash)  # "a1b2c3d4...${hash_largo}"
# NUNCA es igual a la contraseña original

# Debugging de queries
from sqlmodel import select
query = select(Usuario).where(Usuario.deleted_at.is_(None))
print(query)  # Ver SQL generado
```

## 🎯 Próximos Pasos Recomendados

1. **Implementar JWT**: Usar `verify_contrasena()` en login endpoint
2. **Middleware de RBAC**: Decorator que valide `usuario_tiene_codigo_rol()`
3. **Auditoría detallada**: Registrar cambios en tabla separate
4. **Permisos granulares**: Más allá de roles simples
5. **2FA**: Implementar autenticación de dos factores
6. **Rate limiting**: Proteger endpoints de fuerza bruta

## 📚 Ver También

- `app/modules/usuario/README.md` - Documentación completa
- `app/modules/usuario/models.py` - Definiciones de modelos
- `app/modules/usuario/service.py` - Lógica de negocio
- `app/modules/usuario/repository.py` - Acceso a datos
