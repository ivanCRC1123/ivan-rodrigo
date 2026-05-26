from sqlmodel import Session, select
from app.modules.categoria.model import Categoria


class CategoriaService:

    def __init__(self, session: Session):
        self.session = session

    def get_all(self):
        return self.session.exec(select(Categoria)).all()

    def get_by_id(self, categoria_id: int):
        return self.session.get(Categoria, categoria_id)

    def create(self, categoria: Categoria):
        self.session.add(categoria)
        self.session.commit()
        self.session.refresh(categoria)
        return categoria

    def update(self, db_categoria: Categoria, data: dict):
        for key, value in data.items():
            setattr(db_categoria, key, value)

        self.session.add(db_categoria)
        self.session.commit()
        self.session.refresh(db_categoria)
        return db_categoria

    def delete(self, db_categoria: Categoria):
        self.session.delete(db_categoria)
        self.session.commit()