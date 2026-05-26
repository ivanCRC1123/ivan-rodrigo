from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship
from app.modules.producto_ingrediente.model import ProductoIngrediente

if TYPE_CHECKING:
    from app.modules.producto.model import Producto


class Ingrediente(SQLModel, table=True):
    __tablename__ = "ingrediente"

    id: Optional[int] = Field(default=None, primary_key=True)

    nombre: str = Field(max_length=100, unique=True, nullable=False)
    descripcion: Optional[str] = None

    es_alergeno: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    productos: List["Producto"] = Relationship(
        back_populates="ingredientes",
        link_model=ProductoIngrediente
    )