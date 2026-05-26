from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.database import get_session
from app.modules.producto_ingrediente import service

router = APIRouter(prefix="/producto-ingrediente", tags=["ProductoIngrediente"])


@router.post("/")
def create(
    producto_id: int,
    ingrediente_id: int,
    es_removible: bool = False,
    session: Session = Depends(get_session)
):
    return service.create_relation(session, producto_id, ingrediente_id, es_removible)


@router.delete("/")
def delete(
    producto_id: int,
    ingrediente_id: int,
    session: Session = Depends(get_session)
):
    deleted = service.delete_relation(session, producto_id, ingrediente_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Relación no encontrada")

    return {"message": "Relación eliminada"}


@router.get("/producto/{producto_id}")
def by_producto(producto_id: int, session: Session = Depends(get_session)):
    return service.get_by_producto(session, producto_id)


@router.get("/ingrediente/{ingrediente_id}")
def by_ingrediente(ingrediente_id: int, session: Session = Depends(get_session)):
    return service.get_by_ingrediente(session, ingrediente_id)