from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlmodel import Session

from app.core.database import get_session
from app.modules.direccion.service import DireccionEntregaService
from app.modules.direccion.schemas import (
    DireccionEntregaCreate,
    DireccionEntregaUpdate,
    DireccionEntregaRead,
    DireccionEntregaReadSimple,
    DireccionEntregaReadCompleta,
    DireccionCreatedResponse,
    DireccionActualizadaResponse,
    DireccionPrincipalResponse,
)

router = APIRouter(prefix="/api/v1/direcciones", tags=["Direcciones de Entrega"])


def get_service(session: Session = Depends(get_session)) -> DireccionEntregaService:
    return DireccionEntregaService(session)


# ==================== ENDPOINTS DE CREACIÓN ====================

@router.post("/", response_model=DireccionCreatedResponse, status_code=status.HTTP_201_CREATED)
def crear_direccion(
    data: DireccionEntregaCreate,
    service: DireccionEntregaService = Depends(get_service)
):
    """Crea una nueva dirección de entrega
    
    Lógica:
    - Si es la primera dirección del usuario, automáticamente es principal
    - Si se marca como principal, desactiva automáticamente otras direcciones principales
    
    Body:
    {
        "usuario_id": 1,
        "alias": "Casa",
        "calle": "Calle Principal",
        "numero": "123",
        "apartamento": "4B",
        "localidad": "La Plata",
        "codigo_postal": "1900",
        "provincia": "Buenos Aires",
        "notas": "Dejar en portería",
        "es_principal": true
    }
    """
    try:
        direccion = service.crear_direccion(data)
        
        return DireccionCreatedResponse(
            mensaje="Dirección creada exitosamente",
            direccion_id=direccion.id,
            alias=direccion.alias,
            es_principal=direccion.es_principal
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear dirección: {str(e)}"
        )


# ==================== ENDPOINTS DE LECTURA ====================

@router.get("/", response_model=list[DireccionEntregaReadSimple])
def listar_direcciones(
    usuario_id: Annotated[int, Query(gt=0)],
    service: DireccionEntregaService = Depends(get_service)
):
    """Lista todas las direcciones activas de un usuario
    
    Query params:
    - usuario_id: ID del usuario (obligatorio)
    """
    try:
        direcciones = service.obtener_direcciones_usuario(usuario_id)
        return direcciones
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar direcciones: {str(e)}"
        )


@router.get("/usuario/{usuario_id}", response_model=list[DireccionEntregaReadCompleta])
def listar_direcciones_usuario(
    usuario_id: Annotated[int, Path(gt=0)],
    service: DireccionEntregaService = Depends(get_service)
):
    """Lista todas las direcciones de un usuario con dirección completa formateada"""
    try:
        direcciones = service.obtener_direcciones_usuario(usuario_id)
        
        return [
            DireccionEntregaReadCompleta(
                id=d.id,
                alias=d.alias,
                direccion_completa=d.direccion_completa(),
                es_principal=d.es_principal,
                created_at=d.created_at
            )
            for d in direcciones
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar direcciones: {str(e)}"
        )


@router.get("/usuario/{usuario_id}/principal", response_model=DireccionEntregaRead)
def obtener_principal_usuario(
    usuario_id: Annotated[int, Path(gt=0)],
    service: DireccionEntregaService = Depends(get_service)
):
    """Obtiene la dirección principal de un usuario"""
    try:
        direccion = service.obtener_principal_usuario(usuario_id)
        
        if not direccion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Usuario {usuario_id} no tiene dirección principal"
            )
        
        return direccion
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener dirección principal: {str(e)}"
        )


@router.get("/{direccion_id}", response_model=DireccionEntregaRead)
def obtener_direccion(
    direccion_id: Annotated[int, Path(gt=0)],
    service: DireccionEntregaService = Depends(get_service)
):
    """Obtiene una dirección específica por ID"""
    try:
        direccion = service.obtener_direccion_por_id(direccion_id)
        
        if not direccion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dirección {direccion_id} no encontrada"
            )
        
        return direccion
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener dirección: {str(e)}"
        )


# ==================== ENDPOINTS DE ACTUALIZACIÓN ====================

@router.patch("/{direccion_id}", response_model=DireccionActualizadaResponse)
def actualizar_direccion(
    direccion_id: Annotated[int, Path(gt=0)],
    data: DireccionEntregaUpdate,
    service: DireccionEntregaService = Depends(get_service)
):
    """Actualiza una dirección de entrega
    
    Lógica especial:
    - Si se marca como es_principal=True, desactiva automáticamente otras direcciones principales
    
    Body (todos los campos opcionales):
    {
        "alias": "Nuevo alias",
        "calle": "Nueva calle",
        "numero": "456",
        "es_principal": true
    }
    """
    try:
        direccion = service.actualizar_direccion(direccion_id, data)
        
        return DireccionActualizadaResponse(
            mensaje="Dirección actualizada exitosamente",
            direccion_id=direccion.id,
            alias=direccion.alias,
            es_principal=direccion.es_principal,
            updated_at=direccion.updated_at
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar dirección: {str(e)}"
        )


# ==================== ENDPOINTS DE CAMBIO DE PRINCIPAL ====================

@router.patch("/{direccion_id}/principal", response_model=DireccionPrincipalResponse)
def marcar_como_principal(
    direccion_id: Annotated[int, Path(gt=0)],
    service: DireccionEntregaService = Depends(get_service)
):
    """Marca una dirección como principal rápidamente
    
    Desactiva automáticamente otras direcciones principales del usuario.
    Este endpoint es un shortcut para PATCH /direcciones/{id} con es_principal=True.
    """
    try:
        direccion = service.marcar_como_principal(direccion_id)
        
        return DireccionPrincipalResponse(
            mensaje="Dirección marcada como principal exitosamente",
            direccion_id=direccion.id,
            alias=direccion.alias,
            es_principal=direccion.es_principal
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al marcar como principal: {str(e)}"
        )


# ==================== ENDPOINTS DE ELIMINACIÓN ====================

@router.delete("/{direccion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_direccion(
    direccion_id: Annotated[int, Path(gt=0)],
    service: DireccionEntregaService = Depends(get_service)
):
    """Elimina una dirección (soft delete)
    
    Lógica:
    - Si la dirección eliminada era principal, la siguiente se vuelve principal automáticamente
    """
    try:
        service.eliminar_direccion(direccion_id)
        return None
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar dirección: {str(e)}"
        )
