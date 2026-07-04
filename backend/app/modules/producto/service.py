from datetime import datetime
from typing import Optional

from sqlmodel import select, or_
from app.modules.producto.model import Producto
from app.modules.producto.producto_uow import ProductoUnitOfWork
from app.modules.producto_categoria.model import ProductoCategoria
from app.modules.producto_ingrediente.model import ProductoIngrediente
from app.modules.ingrediente.model import Ingrediente
from app.modules.producto.schema import ProductoRead, ProductoIngredienteDetalle
from app.modules.unidad_medida.model import UnidadMedida
from sqlalchemy.orm import selectinload


class ProductoService:

    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def _base_query(self):
        """Base query with eager-loaded relationships"""
        return (
            select(Producto)
            .options(
                selectinload(Producto.categorias),
                selectinload(Producto.ingredientes),
                selectinload(Producto.producto_ingredientes),
            )
        )

    def _to_read(self, producto: Producto) -> ProductoRead:
        """Convierte un Producto ORM a ProductoRead con ingredientes detallados"""
        # Build lookups for ingredient names and unit names
        ing_by_id = {ing.id: ing for ing in producto.ingredientes}

        all_uds = self.uow.session.exec(select(UnidadMedida)).all()
        ud_by_id = {ud.id: ud.simbolo for ud in all_uds}

        ingredientes = []
        for pi in producto.producto_ingredientes:
            ing = ing_by_id.get(pi.ingrediente_id)
            ingredientes.append(
                ProductoIngredienteDetalle(
                    id=pi.ingrediente_id,
                    nombre=ing.nombre if ing else "",
                    cantidad=pi.cantidad,
                    unidad_medida=ud_by_id.get(pi.unidad_medida_id, str(pi.unidad_medida_id)),
                    es_alergeno=ing.es_alergeno if ing else False,
                )
            )

        return ProductoRead(
            id=producto.id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            precio_base=producto.precio_base,
            imagenes_url=producto.imagenes_url or [],
            stock_cantidad=producto.stock_cantidad,
            disponible=producto.disponible,
            unidad_venta_id=producto.unidad_venta_id,
            categorias=producto.categorias,
            ingredientes=ingredientes,
            created_at=producto.created_at,
            updated_at=producto.updated_at,
            deleted_at=producto.deleted_at,
        )

    def get_all(self, include_deleted: bool = False):
        """Obtiene todos los productos, excluyendo eliminados por defecto"""
        statement = self._base_query()
        if not include_deleted:
            statement = statement.where(Producto.deleted_at.is_(None))
        productos = self.uow.session.exec(statement).all()
        return [self._to_read(p) for p in productos]

    def get_by_id(self, producto_id: int, include_deleted: bool = False):
        """Obtiene un producto por ID como ProductoRead, excluyendo eliminados por defecto"""
        statement = (
            self._base_query()
            .where(Producto.id == producto_id)
        )
        if not include_deleted:
            statement = statement.where(Producto.deleted_at.is_(None))
        producto = self.uow.session.exec(statement).first()
        if not producto:
            return None
        return self._to_read(producto)

    def get_orm_by_id(self, producto_id: int, include_deleted: bool = False):
        """Obtiene un producto ORM por ID para operaciones de escritura"""
        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
        )
        if not include_deleted:
            statement = statement.where(Producto.deleted_at.is_(None))
        return self.uow.session.exec(statement).first()

    def create(self, producto: Producto):
        """Crea un nuevo producto y lo retorna con relaciones eager-loaded"""
        self.uow.session.add(producto)
        self.uow.session.flush()
        # Recargar con relaciones eager-loaded para evitar DetachedInstanceError
        return self.get_by_id(producto.id)

    def update(self, db_producto: Producto, data: dict):
        """Actualiza un producto y lo retorna con relaciones eager-loaded"""
        excluded_fields = {"id", "created_at", "deleted_at"}
        for key, value in data.items():
            if key not in excluded_fields and value is not None:
                setattr(db_producto, key, value)

        db_producto.updated_at = datetime.utcnow()
        self.uow.session.add(db_producto)
        self.uow.session.flush()
        # Recargar con relaciones eager-loaded para evitar DetachedInstanceError
        return self.get_by_id(db_producto.id)

    def soft_delete(self, db_producto: Producto):
        """Elimina un producto de forma lógica (commit manejado por UoW)"""
        db_producto.deleted_at = datetime.utcnow()
        db_producto.updated_at = datetime.utcnow()
        self.uow.session.add(db_producto)
        self.uow.session.flush()
        return self._to_read(db_producto)

    def hard_delete(self, db_producto: Producto):
        """Elimina un producto de forma permanente (commit manejado por UoW)"""
        self.uow.session.delete(db_producto)
        self.uow.session.flush()

    def restore(self, db_producto: Producto):
        """Restaura un producto eliminado y lo retorna con relaciones eager-loaded"""
        db_producto.deleted_at = None
        db_producto.updated_at = datetime.utcnow()
        self.uow.session.add(db_producto)
        self.uow.session.flush()
        return self.get_by_id(db_producto.id)

    def update_disponibilidad(self, db_producto: Producto, disponible: bool):
        """Actualiza la disponibilidad y retorna el producto con relaciones eager-loaded"""
        db_producto.disponible = disponible
        db_producto.updated_at = datetime.utcnow()
        self.uow.session.add(db_producto)
        self.uow.session.flush()
        return self.get_by_id(db_producto.id)

    def get_filtered(
        self,
        min_precio: float = 0,
        max_precio: float = 100000,
        limit: int = 10,
        offset: int = 0,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        search: Optional[str] = None,
        include_deleted: bool = False,
    ):
        """Obtiene productos con filtros combinados: precio, categoría, disponibilidad, búsqueda textual"""
        # Construimos la query de IDs filtrados primero (sin JSON columns, DISTINCT funciona)
        # Esto evita el error de PostgreSQL con SELECT DISTINCT en columnas JSON
        id_query = select(Producto.id)

        # Filtro por rango de precio
        id_query = id_query.where(
            Producto.precio_base >= min_precio,
            Producto.precio_base <= max_precio,
        )

        # Filtro por disponibilidad
        if disponible is not None:
            id_query = id_query.where(Producto.disponible == disponible)

        # Filtro por búsqueda textual (ILIKE sobre nombre + descripción)
        if search:
            pattern = f"%{search}%"
            id_query = id_query.where(
                or_(
                    Producto.nombre.ilike(pattern),
                    Producto.descripcion.ilike(pattern),
                )
            )

        # Filtro por categoría (requiere join con tabla intermedia)
        if categoria_id is not None:
            id_query = id_query.join(
                ProductoCategoria,
                Producto.id == ProductoCategoria.producto_id,
            ).where(ProductoCategoria.categoria_id == categoria_id)

        # Excluir soft-deleteados por defecto
        if not include_deleted:
            id_query = id_query.where(Producto.deleted_at.is_(None))

        # DISTINCT solo sobre IDs (evita el problema con JSON)
        id_query = id_query.distinct().offset(offset).limit(limit)

        # Cargar objetos completos con relaciones por los IDs obtenidos
        statement = (
            self._base_query()
            .where(Producto.id.in_(id_query))
            .order_by(Producto.id)
        )
        productos = self.uow.session.exec(statement).all()
        return [self._to_read(p) for p in productos]
