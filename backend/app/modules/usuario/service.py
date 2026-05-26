from datetime import datetime
from typing import Optional
from sqlmodel import Session
import hashlib
import secrets

from app.modules.usuario.models import Usuario, Rol, UsuarioRol
from app.modules.usuario.repository import UsuarioRepository, RolRepository, UsuarioRolRepository
from app.modules.usuario.schemas import UsuarioCreate, UsuarioUpdate, RolCreate, RolUpdate


class UsuarioService:
    """Servicio de lógica de negocio para Usuarios"""

    def __init__(self, session: Session):
        self.session = session
        self.usuario_repo = UsuarioRepository(session)
        self.usuario_rol_repo = UsuarioRolRepository(session)

    def crear_usuario(self, data: UsuarioCreate) -> Usuario:
        """Crea un nuevo usuario con contraseña hasheada"""
        # Verificar si el email ya existe
        if self.usuario_repo.exists_email(data.email):
            raise ValueError(f"El email {data.email} ya está registrado")

        # Hashear la contraseña
        password_hash = self._hash_password(data.password)

        usuario = Usuario(
            email=data.email,
            nombre=data.nombre,
            apellido=data.apellido,
            password_hash=password_hash,
            activo=data.activo
        )

        return self.usuario_repo.create(usuario)

    def obtener_usuario_por_id(self, usuario_id: int) -> Optional[Usuario]:
        """Obtiene un usuario por ID"""
        return self.usuario_repo.get_by_id(usuario_id)

    def obtener_usuario_por_email(self, email: str) -> Optional[Usuario]:
        """Obtiene un usuario por email"""
        return self.usuario_repo.get_by_email(email)

    def listar_usuarios(self, skip: int = 0, limit: int = 100) -> list[Usuario]:
        """Lista todos los usuarios activos"""
        return self.usuario_repo.get_all(skip=skip, limit=limit, include_deleted=False)

    def actualizar_usuario(self, usuario_id: int, data: UsuarioUpdate) -> Optional[Usuario]:
        """Actualiza los datos de un usuario"""
        usuario = self.usuario_repo.get_by_id(usuario_id)
        if not usuario:
            raise ValueError(f"Usuario con ID {usuario_id} no encontrado")

        # Validar email único si se está actualizando
        if data.email and data.email != usuario.email:
            if self.usuario_repo.exists_email(data.email, exclude_id=usuario_id):
                raise ValueError(f"El email {data.email} ya está registrado")

        return self.usuario_repo.update(usuario, data.model_dump(exclude_unset=True))

    def cambiar_contrasena(self, usuario_id: int, password_actual: str, password_nueva: str) -> Usuario:
        """Cambia la contraseña de un usuario"""
        usuario = self.usuario_repo.get_by_id(usuario_id)
        if not usuario:
            raise ValueError(f"Usuario con ID {usuario_id} no encontrado")

        # Verificar contraseña actual
        if not self._verify_password(password_actual, usuario.password_hash):
            raise ValueError("Contraseña actual incorrecta")

        # Hashear y actualizar nueva contraseña
        usuario.password_hash = self._hash_password(password_nueva)
        usuario.updated_at = datetime.utcnow()
        self.session.add(usuario)
        self.session.commit()
        self.session.refresh(usuario)

        return usuario

    def eliminar_usuario(self, usuario_id: int, hard_delete: bool = False) -> None:
        """Elimina un usuario (soft delete por defecto)"""
        usuario = self.usuario_repo.get_by_id(usuario_id, include_deleted=False)
        if not usuario:
            raise ValueError(f"Usuario con ID {usuario_id} no encontrado")

        if hard_delete:
            self.usuario_repo.hard_delete(usuario)
        else:
            self.usuario_repo.soft_delete(usuario)

    def restaurar_usuario(self, usuario_id: int) -> Usuario:
        """Restaura un usuario eliminado"""
        usuario = self.usuario_repo.get_by_id(usuario_id, include_deleted=True)
        if not usuario:
            raise ValueError(f"Usuario con ID {usuario_id} no encontrado")

        return self.usuario_repo.restore(usuario)

    def verificar_contrasena(self, email: str, password: str) -> Optional[Usuario]:
        """Verifica el email y contraseña de un usuario (útil para login)"""
        usuario = self.usuario_repo.get_by_email(email)
        if not usuario or not usuario.is_active():
            return None

        if self._verify_password(password, usuario.password_hash):
            return usuario

        return None

    @staticmethod
    def _hash_password(password: str) -> str:
        """Genera hash PBKDF2 de una contraseña"""
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            bytes.fromhex(salt),
            100000
        )
        return f"{salt}${pwd_hash.hex()}"

    @staticmethod
    def _verify_password(password: str, password_hash: str) -> bool:
        """Verifica una contraseña contra su hash"""
        try:
            salt, pwd_hash = password_hash.split('$')
            new_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                bytes.fromhex(salt),
                100000
            )
            return new_hash.hex() == pwd_hash
        except (ValueError, AttributeError):
            return False


class RolService:
    """Servicio de lógica de negocio para Roles"""

    def __init__(self, session: Session):
        self.session = session
        self.rol_repo = RolRepository(session)

    def crear_rol(self, data: RolCreate) -> Rol:
        """Crea un nuevo rol"""
        # Verificar si el código ya existe
        if self.rol_repo.exists_codigo(data.codigo):
            raise ValueError(f"El código de rol '{data.codigo}' ya existe")

        rol = Rol(
            nombre=data.nombre,
            codigo=data.codigo,
            descripcion=data.descripcion
        )

        return self.rol_repo.create(rol)

    def obtener_rol_por_id(self, rol_id: int) -> Optional[Rol]:
        """Obtiene un rol por ID"""
        return self.rol_repo.get_by_id(rol_id)

    def obtener_rol_por_codigo(self, codigo: str) -> Optional[Rol]:
        """Obtiene un rol por código"""
        return self.rol_repo.get_by_codigo(codigo)

    def listar_roles(self, skip: int = 0, limit: int = 100) -> list[Rol]:
        """Lista todos los roles activos"""
        return self.rol_repo.get_all(skip=skip, limit=limit, include_deleted=False)

    def actualizar_rol(self, rol_id: int, data: RolUpdate) -> Optional[Rol]:
        """Actualiza un rol"""
        rol = self.rol_repo.get_by_id(rol_id)
        if not rol:
            raise ValueError(f"Rol con ID {rol_id} no encontrado")

        # Validar código único si se está actualizando
        if data.codigo and data.codigo != rol.codigo:
            if self.rol_repo.exists_codigo(data.codigo, exclude_id=rol_id):
                raise ValueError(f"El código de rol '{data.codigo}' ya existe")

        return self.rol_repo.update(rol, data.model_dump(exclude_unset=True))

    def eliminar_rol(self, rol_id: int, hard_delete: bool = False) -> None:
        """Elimina un rol (soft delete por defecto)"""
        rol = self.rol_repo.get_by_id(rol_id, include_deleted=False)
        if not rol:
            raise ValueError(f"Rol con ID {rol_id} no encontrado")

        if hard_delete:
            self.rol_repo.hard_delete(rol)
        else:
            self.rol_repo.soft_delete(rol)

    def restaurar_rol(self, rol_id: int) -> Rol:
        """Restaura un rol eliminado"""
        rol = self.rol_repo.get_by_id(rol_id, include_deleted=True)
        if not rol:
            raise ValueError(f"Rol con ID {rol_id} no encontrado")

        return self.rol_repo.restore(rol)


class UsuarioRolService:
    """Servicio de lógica de negocio para la relación Usuario-Rol (RBAC)"""

    def __init__(self, session: Session):
        self.session = session
        self.usuario_repo = UsuarioRepository(session)
        self.rol_repo = RolRepository(session)
        self.usuario_rol_repo = UsuarioRolRepository(session)

    def asignar_rol_a_usuario(self, usuario_id: int, rol_id: int) -> UsuarioRol:
        """Asigna un rol a un usuario"""
        # Verificar que exista el usuario y el rol
        usuario = self.usuario_repo.get_by_id(usuario_id)
        if not usuario:
            raise ValueError(f"Usuario con ID {usuario_id} no encontrado")

        rol = self.rol_repo.get_by_id(rol_id)
        if not rol:
            raise ValueError(f"Rol con ID {rol_id} no encontrado")

        return self.usuario_rol_repo.asignar_rol(usuario_id, rol_id)

    def desasignar_rol_de_usuario(self, usuario_id: int, rol_id: int) -> None:
        """Desasigna un rol de un usuario"""
        usuario = self.usuario_repo.get_by_id(usuario_id)
        if not usuario:
            raise ValueError(f"Usuario con ID {usuario_id} no encontrado")

        rol = self.rol_repo.get_by_id(rol_id)
        if not rol:
            raise ValueError(f"Rol con ID {rol_id} no encontrado")

        self.usuario_rol_repo.desasignar_rol(usuario_id, rol_id)

    def obtener_roles_usuario(self, usuario_id: int) -> list[Rol]:
        """Obtiene todos los roles de un usuario"""
        usuario = self.usuario_repo.get_by_id(usuario_id)
        if not usuario:
            raise ValueError(f"Usuario con ID {usuario_id} no encontrado")

        return self.usuario_rol_repo.get_roles_by_usuario(usuario_id)

    def usuario_tiene_rol(self, usuario_id: int, rol_id: int) -> bool:
        """Verifica si un usuario tiene un rol específico"""
        return self.usuario_rol_repo.usuario_tiene_rol(usuario_id, rol_id)

    def usuario_tiene_codigo_rol(self, usuario_id: int, codigo_rol: str) -> bool:
        """Verifica si un usuario tiene un rol por código"""
        return self.usuario_rol_repo.usuario_tiene_codigo_rol(usuario_id, codigo_rol)
