from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class IngredienteBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    es_alergeno: bool = False


class IngredienteCreate(IngredienteBase):
    pass


class IngredienteUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None


class IngredienteRead(IngredienteBase):
    id: int
    es_alergeno: bool
    created_at: datetime
    updated_at: datetime


class IngredienteReadSimple(SQLModel):
    id: int
    nombre: str