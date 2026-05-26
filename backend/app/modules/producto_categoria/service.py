from sqlmodel import Session, select
from app.modules.producto_categoria.model import ProductoCategoria


def create_relation(session: Session, producto_id: int, categoria_id: int, es_principal: bool = False):
    relation = ProductoCategoria(
        producto_id=producto_id,
        categoria_id=categoria_id,
        es_principal=es_principal
    )

    session.add(relation)
    session.commit()
    session.refresh(relation)
    return relation


def delete_relation(session: Session, producto_id: int, categoria_id: int):
    statement = select(ProductoCategoria).where(
        ProductoCategoria.producto_id == producto_id,
        ProductoCategoria.categoria_id == categoria_id
    )

    relation = session.exec(statement).first()

    if not relation:
        return None

    session.delete(relation)
    session.commit()
    return relation


def get_by_producto(session: Session, producto_id: int):
    statement = select(ProductoCategoria).where(
        ProductoCategoria.producto_id == producto_id
    )
    return session.exec(statement).all()


def get_by_categoria(session: Session, categoria_id: int):
    statement = select(ProductoCategoria).where(
        ProductoCategoria.categoria_id == categoria_id
    )
    return session.exec(statement).all()