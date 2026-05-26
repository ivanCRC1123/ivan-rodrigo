"""Configuración global de pytest para el backend.

Usa la base PostgreSQL real (parcial2) via TestClient.
Cada test limpia las tablas después de ejecutarse para asegurar aislamiento.
"""

from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine, text
from app.main import app
from app.core.config import settings


@pytest.fixture(scope="session")
def db_engine():
    """Engine compartido para toda la sesión de tests"""
    engine = create_engine(settings.database_url, echo=False)
    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture(autouse=True)
def clean_tables(db_engine):
    """Limpia todas las tablas antes de cada test (en orden inverso por FK)"""
    yield  # corre el test
    with Session(db_engine) as session:
        for table in reversed(SQLModel.metadata.sorted_tables):
            session.execute(
                text(f"TRUNCATE TABLE {table.name} RESTART IDENTITY CASCADE")
            )
        session.commit()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Cliente HTTP de prueba — el lifespan crea tablas + seed data al iniciar"""
    with TestClient(app) as c:
        yield c
