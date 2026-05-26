from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.pedido.service import PedidoService
from app.modules.pedido.models import EstadoPedido
from app.modules.pedido.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidoReadSimple,
    PedidoReadConDetalles,
    PedidoCambiarEstado,
    PedidoCreatedResponse,
    EstadoCambiadoResponse,
    HistorialEstadoPedidoRead
)

router = APIRouter(prefix="/api/v1/pedidos", tags=["Pedidos"])


def get_service(session: Session = Depends(get_session)) -> PedidoService:
    return PedidoService(session)


# ==================== ENDPOINTS DE CREACIÓN ====================

@router.post("/", response_model=PedidoCreatedResponse, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    service: PedidoService = Depends(get_service)
):
    """Crea un nuevo pedido (UNIT OF WORK)
    
    Esta operación es CRÍTICA:
    - Valida disponibilidad de productos
    - Crea pedido, detalles e historial en una transacción atómica
    - Si algo falla, se revierte TODO
    
    Body:
    {
        "usuario_id": 1,
        "forma_pago": "TARJETA_CREDITO",
        "direccion_entrega": "Calle Principal 123",
        "observaciones": "Dejar en portería",
        "detalles": [
            {
                "producto_id": 1,
                "cantidad": 2
            }
        ]
    }
    
    Response:
    {
        "mensaje": "Pedido creado exitosamente",
        "pedido_id": 1,
        "numero_pedido": "PED-20240525-A1B2C",
        "monto_total": 500.0,
        "estado": "PENDIENTE"
    }
    """
    try:
        pedido = service.crear_pedido(
            usuario_id=data.usuario_id,
            forma_pago=data.forma_pago,
            direccion_entrega=data.direccion_entrega,
            detalles_data=data.detalles,
            observaciones=data.observaciones
        )
        
        return PedidoCreatedResponse(
            mensaje="Pedido creado exitosamente",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            monto_total=pedido.monto_total,
            estado=pedido.estado
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear pedido: {str(e)}"
        )


# ==================== ENDPOINTS DE LECTURA ====================

@router.get("/", response_model=list[PedidoReadSimple])
def listar_pedidos(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Annotated[Optional[EstadoPedido], Query()] = None,
    service: PedidoService = Depends(get_service)
):
    """Lista todos los pedidos (con filtro opcional por estado)
    
    Query params:
    - skip: Número de registros a saltar (paginación)
    - limit: Número de registros a devolver (max 100)
    - estado: Filtrar por estado (PENDIENTE, CONFIRMADO, etc.)
    """
    if estado:
        return service.listar_por_estado(estado, skip, limit)
    return service.listar_pedidos(skip, limit)


@router.get("/usuario/{usuario_id}", response_model=list[PedidoReadSimple])
def listar_pedidos_usuario(
    usuario_id: Annotated[int, Path(gt=0)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    service: PedidoService = Depends(get_service)
):
    """Lista todos los pedidos de un usuario específico"""
    return service.listar_pedidos_usuario(usuario_id, skip, limit)


@router.get("/{pedido_id}", response_model=PedidoReadConDetalles)
def obtener_pedido(
    pedido_id: Annotated[int, Path(gt=0)],
    service: PedidoService = Depends(get_service)
):
    """Obtiene un pedido con sus detalles"""
    pedido = service.obtener_pedido_por_id(pedido_id)
    
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido {pedido_id} no encontrado"
        )
    
    return pedido


@router.get("/{pedido_id}/historial", response_model=list[HistorialEstadoPedidoRead])
def obtener_historial_estado(
    pedido_id: Annotated[int, Path(gt=0)],
    service: PedidoService = Depends(get_service)
):
    """Obtiene el historial completo de transiciones de un pedido (AUDIT TRAIL)
    
    Este endpoint es crítico para auditoría y trazabilidad.
    Muestra cada cambio de estado con:
    - Estado anterior
    - Estado nuevo
    - Razón del cambio
    - Fecha exacta
    """
    pedido = service.obtener_pedido_por_id(pedido_id)
    
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido {pedido_id} no encontrado"
        )
    
    return service.obtener_historial_estado(pedido_id)


@router.get("/numero/{numero_pedido}", response_model=PedidoReadConDetalles)
def obtener_por_numero_pedido(
    numero_pedido: Annotated[str, Path(min_length=1)],
    service: PedidoService = Depends(get_service)
):
    """Obtiene un pedido por su número único (ej: PED-20240525-A1B2C)"""
    pedido = service.obtener_pedido_por_numero(numero_pedido)
    
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido {numero_pedido} no encontrado"
        )
    
    return pedido


# ==================== ENDPOINTS DE CAMBIO DE ESTADO ====================

@router.patch("/{pedido_id}/estado", response_model=EstadoCambiadoResponse)
def cambiar_estado_pedido(
    pedido_id: Annotated[int, Path(gt=0)],
    data: PedidoCambiarEstado,
    service: PedidoService = Depends(get_service)
):
    """Cambia el estado de un pedido (APPEND-ONLY AUDIT TRAIL)
    
    Registra la transición en el historial de estados.
    La máquina de estados garantiza transiciones válidas.
    
    Body:
    {
        "estado_nuevo": "CONFIRMADO",
        "razon": "Cliente confirmó por teléfono"
    }
    
    Estados válidos:
    - PENDIENTE → CONFIRMADO, CANCELADO
    - CONFIRMADO → EN_PREPARACION, CANCELADO
    - EN_PREPARACION → EN_CAMINO
    - EN_CAMINO → ENTREGADO
    - ENTREGADO, CANCELADO (terminales)
    """
    try:
        pedido = service.cambiar_estado(
            pedido_id=pedido_id,
            estado_nuevo=data.estado_nuevo,
            razon=data.razon
        )
        
        return EstadoCambiadoResponse(
            mensaje=f"Estado actualizado a {data.estado_nuevo}",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            estado_anterior=service.obtener_historial_estado(pedido_id)[-2].estado_nuevo if len(service.obtener_historial_estado(pedido_id)) > 1 else EstadoPedido.PENDIENTE,
            estado_nuevo=pedido.estado,
            fecha_cambio=pedido.updated_at
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{pedido_id}/cancelar", response_model=EstadoCambiadoResponse)
def cancelar_pedido(
    pedido_id: Annotated[int, Path(gt=0)],
    razon: Annotated[Optional[str], Query()] = None,
    service: PedidoService = Depends(get_service)
):
    """Cancela un pedido (solo si está en PENDIENTE o CONFIRMADO)
    
    Query params:
    - razon: Razón de la cancelación (opcional)
    """
    try:
        pedido = service.cancelar_pedido(pedido_id, razon)
        
        historial = service.obtener_historial_estado(pedido_id)
        estado_anterior = historial[-2].estado_nuevo if len(historial) > 1 else EstadoPedido.PENDIENTE
        
        return EstadoCambiadoResponse(
            mensaje="Pedido cancelado exitosamente",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            estado_anterior=estado_anterior,
            estado_nuevo=pedido.estado,
            fecha_cambio=pedido.updated_at
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==================== ENDPOINTS DE VALIDACIÓN ====================

@router.get("/{pedido_id}/puede-cancelarse")
def puede_cancelarse(
    pedido_id: Annotated[int, Path(gt=0)],
    service: PedidoService = Depends(get_service)
):
    """Verifica si un pedido puede ser cancelado"""
    pedido = service.obtener_pedido_por_id(pedido_id)
    
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido {pedido_id} no encontrado"
        )
    
    puede = pedido.puede_cancelarse()
    
    return {
        "puede_cancelarse": puede,
        "estado_actual": pedido.estado,
        "mensaje": "Sí puede cancelarse" if puede else f"No puede cancelarse (estado: {pedido.estado})"
    }
