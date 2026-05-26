from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Header, status
from sqlmodel import Session

from app.core.database import get_session

# ==================== JWT CONFIG ====================

SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas


# ==================== JWT HELPERS ====================

def create_access_token(data: dict) -> str:
    """Create JWT with user_id, email, and roles list"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decode and validate JWT, return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )


# ==================== DEPENDENCIES ====================

async def get_current_user(
    authorization: str = Header(...),
    session: Session = Depends(get_session)
):
    """Extract current user from JWT in Authorization header. Format: 'Bearer <token>'"""
    # Lazy imports to avoid circular dependency with usuario.router
    from app.modules.usuario.models import Usuario
    from app.modules.usuario.repository import UsuarioRepository

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Formato inválido: use Bearer <token>"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Header Authorization requerido"
        )

    payload = decode_access_token(token)
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: no contiene user_id"
        )

    repo = UsuarioRepository(session)
    user = repo.get_by_id(int(user_id))
    if not user or not user.is_active():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo"
        )

    return user


class RoleChecker:
    """Dependency to check if current user has required roles.

    Usage:
        Depends(RoleChecker("ADMIN"))
        Depends(RoleChecker("ADMIN", "STOCK"))

    The user's roles are available on user.roles (list of Rol objects with .codigo)
    """

    def __init__(self, *allowed_roles: str):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user = Depends(get_current_user)):
        if not current_user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes roles asignados"
            )

        user_role_codes = {r.codigo for r in current_user.roles}
        if not any(role in user_role_codes for role in self.allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere uno de estos roles: {', '.join(self.allowed_roles)}"
            )

        return current_user
