from typing import Optional
from sqlmodel import Session

from app.modules.direccion.models import DireccionEntrega
from app.modules.direccion.repository import DireccionEntregaRepository
from app.modules.direccion.schemas import DireccionEntregaCreate, DireccionEntregaUpdate


class DireccionEntregaService:
    """Servicio de lógica de negocio para Direcciones de Entrega
    
    Reglas de negocio:
    - Un usuario solo puede tener UNA dirección principal
    - Si se marca una dirección como principal, las demás se desactivan automáticamente
    - Las direcciones se eliminan de forma lógica (soft delete)
    """

    def __init__(self, session: Session):
        self.session = session
        self.repo = DireccionEntregaRepository(session)

    def crear_direccion(self, data: DireccionEntregaCreate) -> DireccionEntrega:
        """Crea una nueva dirección de entrega
        
        Lógica:
        - Si es_principal=True, desactiva otras direcciones principales
        - Si es la primera dirección, automáticamente se vuelve principal
        
        Args:
            data: Datos de la dirección a crear
            
        Returns:
            Dirección creada
            
        Raises:
            ValueError: Si hay errores de validación
        """
        try:
            # Validar que el usuario exista (esto se haría con get_session del usuario)
            # Por ahora asumimos que viene validado
            
            # Verificar si es la primera dirección del usuario
            cantidad_direcciones = self.repo.count_by_usuario(data.usuario_id, include_deleted=False)
            
            # Si es la primera dirección, automáticamente es principal
            if cantidad_direcciones == 0:
                data.es_principal = True
            
            # Si se marca como principal, desactivar otras
            if data.es_principal:
                self._asegurar_una_principal(data.usuario_id)
            
            # Crear la dirección
            direccion = DireccionEntrega(
                usuario_id=data.usuario_id,
                alias=data.alias,
                calle=data.calle,
                numero=data.numero,
                apartamento=data.apartamento,
                localidad=data.localidad,
                codigo_postal=data.codigo_postal,
                provincia=data.provincia,
                notas=data.notas,
                es_principal=data.es_principal
            )
            
            direccion = self.repo.create(direccion)
            self.session.commit()
            self.session.refresh(direccion)
            
            return direccion
            
        except Exception as e:
            self.session.rollback()
            raise

    def obtener_direccion_por_id(self, direccion_id: int) -> Optional[DireccionEntrega]:
        """Obtiene una dirección por ID"""
        return self.repo.get_by_id(direccion_id)

    def obtener_direcciones_usuario(self, usuario_id: int) -> list[DireccionEntrega]:
        """Obtiene todas las direcciones activas de un usuario"""
        return self.repo.get_by_usuario_id(usuario_id, include_deleted=False)

    def obtener_principal_usuario(self, usuario_id: int) -> Optional[DireccionEntrega]:
        """Obtiene la dirección principal de un usuario"""
        return self.repo.get_principal_by_usuario(usuario_id)

    def actualizar_direccion(
        self,
        direccion_id: int,
        data: DireccionEntregaUpdate
    ) -> DireccionEntrega:
        """Actualiza una dirección de entrega
        
        Lógica:
        - Si es_principal cambia a True, desactiva otras direcciones principales
        
        Args:
            direccion_id: ID de la dirección a actualizar
            data: Datos a actualizar
            
        Returns:
            Dirección actualizada
            
        Raises:
            ValueError: Si la dirección no existe
        """
        try:
            direccion = self.repo.get_by_id(direccion_id)
            
            if not direccion:
                raise ValueError(f"Dirección {direccion_id} no encontrada")
            
            # Si se marca como principal, desactivar otras
            if data.es_principal and not direccion.es_principal:
                self._asegurar_una_principal(direccion.usuario_id, exclude_id=direccion_id)
            
            # Construir dict de actualización (solo campos no None)
            update_data = {}
            for field, value in data.dict(exclude_unset=True).items():
                if value is not None:
                    update_data[field] = value
            
            direccion = self.repo.update(direccion, update_data)
            self.session.commit()
            self.session.refresh(direccion)
            
            return direccion
            
        except Exception as e:
            self.session.rollback()
            raise

    def marcar_como_principal(self, direccion_id: int) -> DireccionEntrega:
        """Marca una dirección como principal y desactiva las demás
        
        Args:
            direccion_id: ID de la dirección a marcar como principal
            
        Returns:
            Dirección actualizada
            
        Raises:
            ValueError: Si la dirección no existe
        """
        try:
            direccion = self.repo.get_by_id(direccion_id)
            
            if not direccion:
                raise ValueError(f"Dirección {direccion_id} no encontrada")
            
            if direccion.is_deleted():
                raise ValueError(f"No se puede marcar una dirección eliminada como principal")
            
            # Desactivar otras direcciones principales
            self._asegurar_una_principal(direccion.usuario_id, exclude_id=direccion_id)
            
            # Marcar como principal
            direccion.es_principal = True
            direccion = self.repo.update(direccion, {"es_principal": True})
            
            self.session.commit()
            self.session.refresh(direccion)
            
            return direccion
            
        except Exception as e:
            self.session.rollback()
            raise

    def eliminar_direccion(self, direccion_id: int) -> DireccionEntrega:
        """Elimina una dirección de forma lógica (soft delete)
        
        Lógica:
        - Si la dirección eliminada era principal, la siguiente se vuelve principal
        
        Args:
            direccion_id: ID de la dirección a eliminar
            
        Returns:
            Dirección eliminada
            
        Raises:
            ValueError: Si la dirección no existe
        """
        try:
            direccion = self.repo.get_by_id(direccion_id)
            
            if not direccion:
                raise ValueError(f"Dirección {direccion_id} no encontrada")
            
            # Si era principal, establecer la siguiente como principal
            era_principal = direccion.es_principal
            
            direccion = self.repo.soft_delete(direccion)
            
            if era_principal:
                # Obtener la primera dirección activa del usuario
                otras = self.repo.get_otras_direcciones(
                    direccion.usuario_id,
                    exclude_id=direccion_id
                )
                
                if otras:
                    # Marcar la primera como principal
                    primera = otras[0]
                    primera.es_principal = True
                    self.repo.update(primera, {"es_principal": True})
            
            self.session.commit()
            
            return direccion
            
        except Exception as e:
            self.session.rollback()
            raise

    def _asegurar_una_principal(
        self,
        usuario_id: int,
        exclude_id: Optional[int] = None
    ) -> None:
        """Desactiva todas las direcciones principales de un usuario (excepto una)
        
        Se llama ANTES de crear/actualizar una dirección a es_principal=True.
        Garantiza que solo exista UNA dirección principal por usuario.
        """
        self.repo.desactivar_principal_usuario(usuario_id, exclude_id=exclude_id)
