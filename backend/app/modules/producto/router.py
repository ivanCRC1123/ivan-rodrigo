from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.producto.model import Producto
from app.modules.producto.schema import (
    ProductoCreate, 
    ProductoRead, 
    ProductoUpdate,
    ProductoUpdateDisponibilidad
)
from app.modules.producto.service import ProductoService

router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])


def get_service(session: Session = Depends(get_session)):
    return ProductoService(session)


@router.get("/", response_model=list[ProductoRead])
def get_all(
    service: Annotated[ProductoService, Depends(get_service)],
    min_precio: Annotated[float, Query(ge=0, description="Precio mínimo")] = 0,
    max_precio: Annotated[float, Query(ge=0, description="Precio máximo")] = 100000,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    """Lista todos los productos (excluyendo eliminados)"""
    return service.get_filtered(min_precio, max_precio, limit, offset, include_deleted=False)


@router.get("/{producto_id}", response_model=ProductoRead)
def get_by_id(
    service: Annotated[ProductoService, Depends(get_service)],
    producto_id: Annotated[int, Path(gt=0)],
):
    """Obtiene un producto por ID"""
    producto = service.get_by_id(producto_id)

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return producto


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create(
    data: ProductoCreate,
    service: Annotated[ProductoService, Depends(get_service)],
):
    """Crea un nuevo producto"""
    producto = Producto(**data.model_dump())
    return service.create(producto)


@router.put("/{producto_id}", response_model=ProductoRead)
def update(
    service: Annotated[ProductoService, Depends(get_service)],
    data: ProductoUpdate,
    producto_id: Annotated[int, Path(gt=0)],
):
    """Actualiza un producto"""
    producto = service.get_by_id(producto_id)

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return service.update(producto, data.model_dump(exclude_unset=True))


@router.patch("/{producto_id}/disponibilidad", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def update_disponibilidad(
    service: Annotated[ProductoService, Depends(get_service)],
    data: ProductoUpdateDisponibilidad,
    producto_id: Annotated[int, Path(gt=0)],
):
    """Actualiza la disponibilidad de un producto (PATCH /api/v1/productos/{id}/disponibilidad)
    
    Permite activar o desactivar un producto sin afectar otros campos.
    """
    producto = service.get_by_id(producto_id)

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    return service.update_disponibilidad(producto, data.disponible)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    service: Annotated[ProductoService, Depends(get_service)],
    producto_id: Annotated[int, Path(gt=0)],
    hard_delete: Annotated[bool, Query(description="Si es True, elimina permanentemente")] = False,
):
    """Elimina un producto (soft delete por defecto)
    
    - Si hard_delete=False (default): Soft delete (marca como eliminado)
    - Si hard_delete=True: Hard delete (elimina permanentemente de la BD)
    """
    producto = service.get_by_id(producto_id, include_deleted=True)

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    if hard_delete:
        service.hard_delete(producto)
    else:
        service.soft_delete(producto)
    return


@router.post("/{producto_id}/restaurar", response_model=ProductoRead, status_code=status.HTTP_200_OK)
def restore(
    service: Annotated[ProductoService, Depends(get_service)],
    producto_id: Annotated[int, Path(gt=0)],
):
    """Restaura un producto que fue eliminado (soft delete)"""
    producto = service.get_by_id(producto_id, include_deleted=True)

    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    if not producto.is_deleted():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El producto no está eliminado"
        )

    return service.restore(producto)
