from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class ProductoIngrediente(SQLModel, table=True):
    __tablename__ = "producto_ingrediente"

    producto_id: Optional[int] = Field(
        default=None,
        foreign_key="producto.id",
        primary_key=True
    )

    ingrediente_id: Optional[int] = Field(
        default=None,
        foreign_key="ingrediente.id",
        primary_key=True
    )

    es_removible: bool = Field(default=False, nullable=False)