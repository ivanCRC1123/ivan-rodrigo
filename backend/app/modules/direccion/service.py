from datetime import datetime
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

    def crear_direccion(self, data, usuario_id: int) -> DireccionEntrega:
        """Crea una nueva dirección de entrega para un usuario
        
        Args:
            data: Schema con datos de la dirección (DireccionEntregaCreate o DireccionEntregaCreateCliente)
            usuario_id: ID del usuario propietario (del token o explícito para admin)
            
        Returns:
            Dirección creada
            
        Raises:
            ValueError: Si hay errores de validación
        """
        try:
            cantidad_direcciones = self.repo.count_by_usuario(usuario_id, include_deleted=False)
            
            # Si es la primera dirección, automáticamente es principal
            es_principal = data.es_principal
            if cantidad_direcciones == 0:
                es_principal = True
            
            # Si se marca como principal, desactivar otras
            if es_principal:
                self._asegurar_una_principal(usuario_id)
            
            # Crear la dirección
            direccion = DireccionEntrega(
                usuario_id=usuario_id,
                alias=data.alias,
                calle=data.calle,
                numero=data.numero,
                apartamento=data.apartamento,
                localidad=data.localidad,
                codigo_postal=data.codigo_postal,
                provincia=data.provincia,
                notas=data.notas,
                es_principal=es_principal
            )
            
            direccion = self.repo.create(direccion)
            self.session.commit()
            self.session.refresh(direccion)
            
            return direccion
            
        except Exception as e:
            self.session.rollback()
            raise

    def obtener_direccion_por_id(self, direccion_id: int, include_deleted: bool = False) -> Optional[DireccionEntrega]:
        """Obtiene una dirección por ID"""
        return self.repo.get_by_id(direccion_id, include_deleted=include_deleted)

    def obtener_direcciones_usuario(self, usuario_id: int) -> list[DireccionEntrega]:
        """Obtiene todas las direcciones activas de un usuario"""
        return self.repo.get_by_usuario_id(usuario_id, include_deleted=False)

    def obtener_principal_usuario(self, usuario_id: int) -> Optional[DireccionEntrega]:
        """Obtiene la dirección principal de un usuario"""
        return self.repo.get_principal_by_usuario(usuario_id)

    def _validar_pertenencia(self, direccion_id: int, usuario_id: int, include_deleted: bool = False) -> DireccionEntrega:
        """Valida que una dirección exista y pertenezca al usuario indicado
        
        Args:
            direccion_id: ID de la dirección
            usuario_id: ID del usuario que reclama pertenencia
            include_deleted: Si True, incluye direcciones eliminadas (útil para restaurar)
            
        Returns:
            Dirección si pertenece al usuario
            
        Raises:
            ValueError: Si no existe o no pertenece al usuario
        """
        direccion = self.repo.get_by_id(direccion_id, include_deleted=include_deleted)
        if not direccion:
            raise ValueError(f"Dirección {direccion_id} no encontrada")
        if direccion.usuario_id != usuario_id:
            raise ValueError(f"Dirección {direccion_id} no encontrada")
        return direccion

    def actualizar_direccion(
        self,
        direccion_id: int,
        data: DireccionEntregaUpdate,
        usuario_id: Optional[int] = None,
    ) -> DireccionEntrega:
        """Actualiza una dirección de entrega
        
        Lógica:
        - Si es_principal cambia a True, desactiva otras direcciones principales
        
        Args:
            direccion_id: ID de la dirección a actualizar
            data: Datos a actualizar
            usuario_id: Si se provee, valida pertenencia del usuario
            
        Returns:
            Dirección actualizada
            
        Raises:
            ValueError: Si la dirección no existe o no pertenece al usuario
        """
        try:
            if usuario_id is not None:
                direccion = self._validar_pertenencia(direccion_id, usuario_id)
            else:
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

    def marcar_como_principal(self, direccion_id: int, usuario_id: Optional[int] = None) -> DireccionEntrega:
        """Marca una dirección como principal y desactiva las demás
        
        Args:
            direccion_id: ID de la dirección a marcar como principal
            usuario_id: Si se provee, valida pertenencia del usuario
            
        Returns:
            Dirección actualizada
            
        Raises:
            ValueError: Si la dirección no existe o no pertenece al usuario
        """
        try:
            if usuario_id is not None:
                direccion = self._validar_pertenencia(direccion_id, usuario_id)
            else:
                direccion = self.repo.get_by_id(direccion_id)
            
            if not direccion:
                raise ValueError(f"Dirección {direccion_id} no encontrada")
            
            if direccion.is_deleted():
                raise ValueError("No se puede marcar una dirección eliminada como principal")
            
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

    def eliminar_direccion(self, direccion_id: int, usuario_id: Optional[int] = None) -> DireccionEntrega:
        """Elimina una dirección de forma lógica (soft delete)
        
        Lógica:
        - Si la dirección eliminada era principal, la siguiente se vuelve principal
        
        Args:
            direccion_id: ID de la dirección a eliminar
            usuario_id: Si se provee, valida pertenencia del usuario
            
        Returns:
            Dirección eliminada
            
        Raises:
            ValueError: Si la dirección no existe o no pertenece al usuario
        """
        try:
            if usuario_id is not None:
                direccion = self._validar_pertenencia(direccion_id, usuario_id)
            else:
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

    def restaurar_direccion(self, direccion_id: int, usuario_id: Optional[int] = None) -> DireccionEntrega:
        """Restaura una dirección eliminada (soft delete reversal)
        
        Args:
            direccion_id: ID de la dirección a restaurar
            usuario_id: Si se provee, valida pertenencia del usuario
            
        Returns:
            Dirección restaurada
            
        Raises:
            ValueError: Si la dirección no existe o no pertenece al usuario
        """
        try:
            if usuario_id is not None:
                direccion = self._validar_pertenencia(direccion_id, usuario_id, include_deleted=True)
            else:
                direccion = self.repo.get_by_id(direccion_id, include_deleted=True)
            
            if not direccion:
                raise ValueError(f"Dirección {direccion_id} no encontrada")
            
            if not direccion.is_deleted():
                raise ValueError(f"La dirección {direccion_id} no está eliminada")
            
            direccion.deleted_at = None
            direccion.updated_at = datetime.utcnow()
            self.session.add(direccion)
            self.session.commit()
            self.session.refresh(direccion)
            
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
