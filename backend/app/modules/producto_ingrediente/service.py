from sqlmodel import Session, select
from app.modules.producto_ingrediente.model import ProductoIngrediente


def create_relation(session: Session, producto_id: int, ingrediente_id: int, es_removible: bool):
    relation = ProductoIngrediente(
        producto_id=producto_id,
        ingrediente_id=ingrediente_id,
        es_removible=es_removible
    )
    session.add(relation)
    session.commit()
    session.refresh(relation)
    return relation


def delete_relation(session: Session, producto_id: int, ingrediente_id: int):
    statement = select(ProductoIngrediente).where(
        ProductoIngrediente.producto_id == producto_id,
        ProductoIngrediente.ingrediente_id == ingrediente_id
    )
    relation = session.exec(statement).first()

    if not relation:
        return False

    session.delete(relation)
    session.commit()
    return True


def get_by_producto(session: Session, producto_id: int):
    return session.exec(
        select(ProductoIngrediente).where(
            ProductoIngrediente.producto_id == producto_id
        )
    ).all()


def get_by_ingrediente(session: Session, ingrediente_id: int):
    return session.exec(
        select(ProductoIngrediente).where(
            ProductoIngrediente.ingrediente_id == ingrediente_id
        )
    ).all()