from datetime import datetime
from sqlmodel import Session, select
from app.modules.producto.model import Producto
from sqlalchemy.orm import selectinload


class ProductoService:

    def __init__(self, session: Session):
        self.session = session

    def get_all(self, include_deleted: bool = False):
        """Obtiene todos los productos, excluyendo eliminados por defecto"""
        statement = (
            select(Producto)
            .options(
                selectinload(Producto.categorias),
                selectinload(Producto.ingredientes)
            )
        )
        if not include_deleted:
            statement = statement.where(Producto.deleted_at.is_(None))
        return self.session.exec(statement).all()

    def get_by_id(self, producto_id: int, include_deleted: bool = False):
        """Obtiene un producto por ID, excluyendo eliminados por defecto"""
        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
            .options(
                selectinload(Producto.categorias),
                selectinload(Producto.ingredientes)
            )
        )
        if not include_deleted:
            statement = statement.where(Producto.deleted_at.is_(None))
        return self.session.exec(statement).first()

    def create(self, producto: Producto):
        """Crea un nuevo producto"""
        self.session.add(producto)
        self.session.commit()
        self.session.refresh(producto)
        return producto

    def update(self, db_producto: Producto, data: dict):
        """Actualiza un producto (excluye campos de auditoría)"""
        # No permitir actualizar campos de auditoría
        excluded_fields = {"id", "created_at", "deleted_at"}
        for key, value in data.items():
            if key not in excluded_fields and value is not None:
                setattr(db_producto, key, value)

        db_producto.updated_at = datetime.utcnow()
        self.session.add(db_producto)
        self.session.commit()
        self.session.refresh(db_producto)
        return db_producto

    def soft_delete(self, db_producto: Producto):
        """Elimina un producto de forma lógica (soft delete)"""
        db_producto.deleted_at = datetime.utcnow()
        db_producto.updated_at = datetime.utcnow()
        self.session.add(db_producto)
        self.session.commit()
        self.session.refresh(db_producto)
        return db_producto

    def hard_delete(self, db_producto: Producto):
        """Elimina un producto de forma permanente (hard delete)"""
        self.session.delete(db_producto)
        self.session.commit()

    def restore(self, db_producto: Producto):
        """Restaura un producto eliminado"""
        db_producto.deleted_at = None
        db_producto.updated_at = datetime.utcnow()
        self.session.add(db_producto)
        self.session.commit()
        self.session.refresh(db_producto)
        return db_producto

    def update_disponibilidad(self, db_producto: Producto, disponible: bool):
        """Actualiza la disponibilidad de un producto"""
        db_producto.disponible = disponible
        db_producto.updated_at = datetime.utcnow()
        self.session.add(db_producto)
        self.session.commit()
        self.session.refresh(db_producto)
        return db_producto
    
    def get_filtered(self, min_precio, max_precio, limit, offset, include_deleted: bool = False):
        """Obtiene productos filtrados por rango de precio"""
        statement = (
            select(Producto)
            .options(
                selectinload(Producto.categorias),
                selectinload(Producto.ingredientes)
            )
            .where(
                Producto.precio_base >= min_precio,
                Producto.precio_base <= max_precio
            )
        )
        if not include_deleted:
            statement = statement.where(Producto.deleted_at.is_(None))
        statement = statement.offset(offset).limit(limit)
        return self.session.exec(statement).all()
