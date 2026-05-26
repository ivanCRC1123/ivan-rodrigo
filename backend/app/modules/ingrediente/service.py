from sqlmodel import Session, select
from fastapi import HTTPException

from app.modules.ingrediente.model import Ingrediente


def create(session: Session, data):
    ingrediente = Ingrediente(**data.model_dump())
    session.add(ingrediente)
    session.commit()
    session.refresh(ingrediente)
    return ingrediente


def get_all(session: Session, limit: int):
    return session.exec(select(Ingrediente).limit(limit)).all()


def get_by_id(session: Session, ingrediente_id: int):
    ingrediente = session.get(Ingrediente, ingrediente_id)

    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    return ingrediente


def update(session: Session, ingrediente_id: int, data):
    ingrediente = session.get(Ingrediente, ingrediente_id)

    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    for key, value in data.items():
        setattr(ingrediente, key, value)

    session.add(ingrediente)
    session.commit()
    session.refresh(ingrediente)

    return ingrediente


def delete(session: Session, ingrediente_id: int):
    ingrediente = session.get(Ingrediente, ingrediente_id)

    if not ingrediente:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")

    session.delete(ingrediente)
    session.commit()

    return {"message": "Ingrediente eliminado"}
