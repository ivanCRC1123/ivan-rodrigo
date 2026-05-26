from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlmodel import Session
from fastapi import Query

from app.core.database import get_session
from app.modules.ingrediente import service
from app.modules.ingrediente.schema import (
    IngredienteCreate,
    IngredienteUpdate,
    IngredienteRead
)

router = APIRouter(prefix="/ingredientes", tags=["Ingredientes"])


@router.post("/", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def create(
    data: IngredienteCreate,
    session: Session = Depends(get_session)
):
    return service.create(session, data)


@router.get("/", response_model=list[IngredienteRead], status_code=status.HTTP_200_OK)
def get_all(
    limit: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session)
):
    return service.get_all(session, limit)


@router.get("/{ingrediente_id}", response_model=IngredienteRead, status_code=status.HTTP_200_OK)
def get_by_id(
    ingrediente_id: int = Path(..., gt=0),
    session: Session = Depends(get_session)
):
    ingrediente = service.get_by_id(session, ingrediente_id)

    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    return ingrediente


@router.put("/{ingrediente_id}", response_model=IngredienteRead, status_code=status.HTTP_200_OK)
def update(
    data: IngredienteUpdate,
    ingrediente_id: int = Path(..., gt=0),
    session: Session = Depends(get_session)
):
    ingrediente = service.get_by_id(session, ingrediente_id)

    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    return service.update(session, ingrediente_id, data.model_dump(exclude_unset=True))


@router.delete("/{ingrediente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    ingrediente_id: int = Path(..., gt=0),
    session: Session = Depends(get_session)
):
    ingrediente = service.get_by_id(session, ingrediente_id)

    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    service.delete(session, ingrediente_id)
    return None