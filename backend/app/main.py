from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session
from app.core.database import engine, get_session
from app.core.seed import seed_database

from app.modules.categoria.router import router as categoria_router
from app.modules.ingrediente.router import router as ingrediente_router
from app.modules.producto.router import router as producto_router
from app.modules.producto_categoria.router import router as producto_categoria_router
from app.modules.producto_ingrediente.router import router as producto_ingrediente_router
from app.modules.usuario.router import router as usuario_router
from app.modules.pedido.router import router as pedido_router
from app.modules.direccion.router import router as direccion_router

from app.modules.categoria.model import Categoria  
from app.modules.ingrediente.model import Ingrediente  
from app.modules.producto.model import Producto 
from app.modules.producto_categoria.model import ProductoCategoria  
from app.modules.producto_ingrediente.model import ProductoIngrediente
from app.modules.usuario.models import Usuario, Rol, UsuarioRol  
from app.modules.pedido.models import Pedido, DetallePedido, HistorialEstadoPedido  
from app.modules.direccion.models import DireccionEntrega  

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear todas las tablas
    SQLModel.metadata.create_all(engine)
    
    # Poblar seed data
    with Session(engine) as session:
        seed_database(session)
    
    yield


app = FastAPI(
    title="API Parcial FastAPI + SQLModel",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categoria_router)
app.include_router(ingrediente_router)
app.include_router(producto_router)
app.include_router(producto_categoria_router)
app.include_router(producto_ingrediente_router)
app.include_router(usuario_router)
app.include_router(pedido_router)
app.include_router(direccion_router)


@app.get("/")
def healthcheck():
    return {"message": "Backend activo"}
