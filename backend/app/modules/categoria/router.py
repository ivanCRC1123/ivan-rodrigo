from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.categoria.service import CategoriaService
from app.modules.categoria.model import Categoria
from app.modules.categoria.schema import CategoriaCreate, CategoriaUpdate, CategoriaRead

router = APIRouter(prefix="/categorias", tags=["Categorias"])


def get_service(session: Session = Depends(get_session)):
    return CategoriaService(session)


@router.get("/", response_model=list[CategoriaRead], status_code=status.HTTP_200_OK)
def get_all(service: CategoriaService = Depends(get_service)):
    return service.get_all()


@router.get("/{categoria_id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def get_by_id(
    categoria_id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_service)
):
    categoria = service.get_by_id(categoria_id)

    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    return categoria


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_service)
):
    categoria = Categoria(**data.model_dump())
    return service.create(categoria)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def update(
    data: CategoriaUpdate,
    categoria_id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_service)
):
    categoria = service.get_by_id(categoria_id)

    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    return service.update(categoria, data.model_dump(exclude_unset=True))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    categoria_id: int = Path(..., gt=0),
    service: CategoriaService = Depends(get_service)
):
    categoria = service.get_by_id(categoria_id)

    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria no encontrada")

    service.delete(categoria)
    return