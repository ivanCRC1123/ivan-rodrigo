from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlmodel import Session

from app.core.auth import RoleChecker
from app.core.database import get_session
from app.modules.categoria.service import CategoriaService
from app.modules.usuario.models import Usuario
from app.modules.categoria.model import Categoria
from app.modules.categoria.schema import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
    CategoriaPublicRead,
    CategoriaPublicResponse,
)

router = APIRouter(prefix="/api/v1/categorias", tags=["Categorias"])


def get_service(session: Session = Depends(get_session)):
    return CategoriaService(session)


# ═══════════════════════════════════════════════════════════════
# PUBLIC ENDPOINT — must be BEFORE /{categoria_id} routes
# ═══════════════════════════════════════════════════════════════


@router.get("/public", response_model=CategoriaPublicResponse)
def get_public(
    parent_id: Optional[int] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: Optional[str] = Query(default=None, min_length=1, description="Búsqueda textual por nombre"),
    service: CategoriaService = Depends(get_service),
):
    items, total = service.get_public(
        parent_id=parent_id,
        offset=offset,
        limit=limit,
        search=search,
    )
    return CategoriaPublicResponse(
        items=[
            CategoriaPublicRead(
                id=c.id,
                nombre=c.nombre,
                descripcion=c.descripcion,
                imagen_url=c.imagen_url,
                parent_id=c.parent_id,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in items
        ],
        total=total,
        limit=limit,
        offset=offset,
    )


# ═══════════════════════════════════════════════════════════════
# ADMIN ENDPOINTS — require ADMIN role
# ═══════════════════════════════════════════════════════════════


@router.get("/", response_model=list[CategoriaRead], status_code=status.HTTP_200_OK)
def get_all(
    service: CategoriaService = Depends(get_service),
    _: Usuario = Depends(RoleChecker("ADMIN")),
):
    return service.get_all()


@router.get("/{categoria_id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def get_by_id(
    categoria_id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_service),
    _: Usuario = Depends(RoleChecker("ADMIN")),
):
    categoria = service.get_by_id(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")
    return categoria


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_service),
    _: Usuario = Depends(RoleChecker("ADMIN")),
):
    categoria = Categoria(**data.model_dump())
    return service.create(categoria)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def update(
    data: CategoriaUpdate,
    categoria_id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_service),
    _: Usuario = Depends(RoleChecker("ADMIN")),
):
    categoria = service.get_by_id(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    return service.update(categoria, data.model_dump(exclude_unset=True))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    categoria_id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_service),
    _: Usuario = Depends(RoleChecker("ADMIN")),
):
    categoria = service.get_by_id(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    service.delete(categoria)
    return
