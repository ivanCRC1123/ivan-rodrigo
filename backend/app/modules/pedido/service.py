from datetime import datetime
from typing import Optional
from sqlmodel import Session
import uuid

from app.modules.pedido.models import (
    Pedido, 
    DetallePedido, 
    HistorialEstadoPedido,
    EstadoPedido,
    FormaPago
)
from app.modules.pedido.repository import (
    PedidoRepository,
    DetallePedidoRepository,
    HistorialEstadoPedidoRepository
)
from app.modules.pedido.schemas import DetallePedidoCreate
from app.modules.producto.model import Producto


class PedidoService:
    """Servicio de lógica de negocio para Pedidos
    
    Implementa Unit of Work pattern para transacciones atómicas.
    Garantiza que pedido, detalles e historial se crean juntos o nada.
    """

    def __init__(self, session: Session):
        self.session = session
        self.pedido_repo = PedidoRepository(session)
        self.detalle_repo = DetallePedidoRepository(session)
        self.historial_repo = HistorialEstadoPedidoRepository(session)

    def crear_pedido(
        self,
        usuario_id: int,
        forma_pago: FormaPago,
        direccion_entrega: str,
        detalles_data: list[DetallePedidoCreate],
        observaciones: Optional[str] = None
    ) -> Pedido:
        """Crea un pedido completo con detalles en una transacción atómica (UNIT OF WORK)
        
        Esta operación es CRÍTICA:
        1. Valida disponibilidad de productos
        2. Crea el pedido
        3. Copia SNAPSHOT de producto en cada detalle
        4. Registra transición inicial de estado
        5. Si algo falla, ROLLBACK automático
        
        Args:
            usuario_id: ID del usuario que compra
            forma_pago: Forma de pago
            direccion_entrega: Dirección de entrega
            detalles_data: Lista de productos a comprar con cantidad
            observaciones: Observaciones opcionales
            
        Returns:
            Pedido creado con todos sus detalles
            
        Raises:
            ValueError: Si hay problemas de validación
            Exception: Si falla la transacción
        """
        try:
            # ========== VALIDACIÓN PRE-TRANSACCIÓN ==========
            
            # Validar que existan los productos y tengan stock
            detalles_validados = []
            monto_total = 0.0
            
            for detalle_input in detalles_data:
                producto = self.session.get(Producto, detalle_input.producto_id)
                
                if not producto:
                    raise ValueError(f"Producto {detalle_input.producto_id} no encontrado")
                
                if producto.is_deleted():
                    raise ValueError(f"Producto {producto.nombre} está eliminado")
                
                if not producto.disponible:
                    raise ValueError(f"Producto {producto.nombre} no está disponible")
                
                if producto.stock_cantidad < detalle_input.cantidad:
                    raise ValueError(
                        f"Stock insuficiente para {producto.nombre}. "
                        f"Disponible: {producto.stock_cantidad}, Solicitado: {detalle_input.cantidad}"
                    )
                
                # Calcular subtotal
                subtotal = producto.precio_base * detalle_input.cantidad
                monto_total += subtotal
                
                # Guardar validado para crear detalles después
                detalles_validados.append({
                    'producto': producto,
                    'cantidad': detalle_input.cantidad,
                    'subtotal': subtotal
                })
            
            if monto_total == 0:
                raise ValueError("El monto total del pedido debe ser mayor a 0")
            
            # ========== UNIT OF WORK: TRANSACCIÓN ATÓMICA ==========
            # Si algo falla aquí, se hace ROLLBACK automático
            
            # 1. CREAR PEDIDO
            numero_pedido = self._generar_numero_pedido()
            
            pedido = Pedido(
                usuario_id=usuario_id,
                numero_pedido=numero_pedido,
                estado=EstadoPedido.PENDIENTE,
                forma_pago=forma_pago,
                monto_total=monto_total,
                direccion_entrega=direccion_entrega,
                observaciones=observaciones
            )
            
            pedido = self.pedido_repo.create(pedido)
            
            # 2. CREAR DETALLES CON SNAPSHOT PATTERN
            # Los valores de nombre y precio se copian del producto en este momento
            # y NUNCA cambiarán aunque el producto se modifique después
            detalles_creados = []
            
            for detalle_validado in detalles_validados:
                producto = detalle_validado['producto']
                
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    
                    # SNAPSHOT PATTERN: Copiar valores del producto
                    # Estos valores quedan INMUTABLES en el detalle
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    
                    cantidad=detalle_validado['cantidad'],
                    subtotal=detalle_validado['subtotal']
                )
                
                detalle = self.detalle_repo.create(detalle)
                detalles_creados.append(detalle)
            
            # 3. REGISTRAR TRANSICIÓN INICIAL DE ESTADO
            # APPEND-ONLY: Primera entrada en el historial
            historial_inicial = HistorialEstadoPedido(
                pedido_id=pedido.id,
                usuario_id=usuario_id,
                estado_anterior=None,  # Primer estado, no hay anterior
                estado_nuevo=EstadoPedido.PENDIENTE,
                razon="Pedido creado"
            )
            
            self.historial_repo.create(historial_inicial)
            
            # ========== COMMIT: Persiste todo ==========
            self.session.commit()
            
            # ========== REFRESH: Cargar relaciones ==========
            self.session.refresh(pedido)
            
            return pedido
            
        except Exception as e:
            # ROLLBACK automático si algo falla
            self.session.rollback()
            raise

    def obtener_pedido_por_id(self, pedido_id: int) -> Optional[Pedido]:
        """Obtiene un pedido por ID"""
        return self.pedido_repo.get_by_id(pedido_id)

    def obtener_pedido_por_numero(self, numero_pedido: str) -> Optional[Pedido]:
        """Obtiene un pedido por número de pedido"""
        return self.pedido_repo.get_by_numero_pedido(numero_pedido)

    def listar_pedidos_usuario(
        self, 
        usuario_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> list[Pedido]:
        """Lista todos los pedidos de un usuario"""
        return self.pedido_repo.get_by_usuario_id(usuario_id, skip, limit)

    def listar_pedidos(self, skip: int = 0, limit: int = 100) -> list[Pedido]:
        """Lista todos los pedidos"""
        return self.pedido_repo.get_all(skip, limit)

    def listar_por_estado(
        self,
        estado: EstadoPedido,
        skip: int = 0,
        limit: int = 100
    ) -> list[Pedido]:
        """Lista pedidos por estado"""
        return self.pedido_repo.get_by_estado(estado, skip, limit)

    def cambiar_estado(
        self,
        pedido_id: int,
        estado_nuevo: EstadoPedido,
        razon: Optional[str] = None,
        usuario_id: Optional[int] = None
    ) -> Pedido:
        """Cambia el estado de un pedido y registra la transición en historial (APPEND-ONLY)
        
        Args:
            pedido_id: ID del pedido
            estado_nuevo: Nuevo estado
            razon: Razón del cambio (ej: "Cancelado por cliente")
            usuario_id: Usuario que realiza el cambio (opcional)
            
        Returns:
            Pedido con estado actualizado
            
        Raises:
            ValueError: Si la transición no es válida
        """
        try:
            pedido = self.pedido_repo.get_by_id(pedido_id, include_deleted=True)
            
            if not pedido:
                raise ValueError(f"Pedido {pedido_id} no encontrado")
            
            if pedido.is_deleted():
                raise ValueError(f"No se puede cambiar estado de un pedido eliminado")
            
            # Validar transición de estado
            if not self._es_transicion_valida(pedido.estado, estado_nuevo):
                raise ValueError(
                    f"Transición inválida: {pedido.estado} -> {estado_nuevo}"
                )
            
            # Actualizar estado del pedido
            estado_anterior = pedido.estado
            pedido.estado = estado_nuevo
            pedido.updated_at = datetime.utcnow()
            
            self.pedido_repo.update(pedido, {"estado": estado_nuevo})
            
            # Registrar transición en historial (APPEND-ONLY)
            historial = HistorialEstadoPedido(
                pedido_id=pedido.id,
                usuario_id=usuario_id,
                estado_anterior=estado_anterior,
                estado_nuevo=estado_nuevo,
                razon=razon
            )
            
            self.historial_repo.create(historial)

            # ========== STOCK DEDUCTION ==========
            # Cuando el pedido se marca como ENTREGADO, descontar del stock
            # de cada producto la cantidad comprada.
            if estado_nuevo == EstadoPedido.ENTREGADO:
                for detalle in pedido.detalles:
                    producto = self.session.get(Producto, detalle.producto_id)
                    
                    if not producto:
                        # El producto fue eliminado de la BD — log el problema
                        # pero no impedimos la entrega del pedido
                        print(f"⚠️ Producto {detalle.producto_id} no encontrado al descontar stock")
                        continue
                    
                    # Descontar la cantidad comprada del stock actual
                    nuevo_stock = producto.stock_cantidad - detalle.cantidad
                    
                    # Evitar stock negativo (por si hubo una devolución/ajuste manual)
                    producto.stock_cantidad = max(0, nuevo_stock)
                    
                    # Marcar como no disponible si llegó a 0
                    if producto.stock_cantidad == 0:
                        producto.disponible = False
                    
                    self.session.add(producto)
            
            # Commit de la transacción
            self.session.commit()
            self.session.refresh(pedido)
            
            return pedido
            
        except Exception as e:
            self.session.rollback()
            raise

    def cancelar_pedido(self, pedido_id: int, razon: Optional[str] = None) -> Pedido:
        """Cancela un pedido si es posible
        
        Un pedido solo puede cancelarse si está en estado PENDIENTE o CONFIRMADO.
        """
        pedido = self.pedido_repo.get_by_id(pedido_id)
        
        if not pedido:
            raise ValueError(f"Pedido {pedido_id} no encontrado")
        
        if not pedido.puede_cancelarse():
            raise ValueError(
                f"No se puede cancelar pedido en estado {pedido.estado}. "
                f"Solo se pueden cancelar pedidos PENDIENTE o CONFIRMADO."
            )
        
        return self.cambiar_estado(
            pedido_id,
            EstadoPedido.CANCELADO,
            razon or "Cancelado por usuario"
        )

    def obtener_historial_estado(self, pedido_id: int) -> list[HistorialEstadoPedido]:
        """Obtiene el historial completo de transiciones de un pedido"""
        return self.historial_repo.get_by_pedido_id(pedido_id)

    @staticmethod
    def _generar_numero_pedido() -> str:
        """Genera un número único de pedido
        
        Formato: PED-YYYYMMDD-XXXXX (ej: PED-20240525-A1B2C)
        """
        from datetime import datetime as dt
        fecha = dt.now().strftime("%Y%m%d")
        codigo = str(uuid.uuid4())[:5].upper()
        return f"PED-{fecha}-{codigo}"

    @staticmethod
    def _es_transicion_valida(estado_actual: EstadoPedido, estado_nuevo: EstadoPedido) -> bool:
        """Valida si la transición de estado es permitida
        
        Máquina de estados del pedido:
        PENDIENTE → CONFIRMADO, CANCELADO
        CONFIRMADO → EN_PREPARACION, CANCELADO
        EN_PREPARACION → EN_CAMINO
        EN_CAMINO → ENTREGADO
        ENTREGADO → (terminal)
        CANCELADO → (terminal)
        """
        transiciones_validas = {
            EstadoPedido.PENDIENTE: [EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO],
            EstadoPedido.CONFIRMADO: [EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO],
            EstadoPedido.EN_PREPARACION: [EstadoPedido.EN_CAMINO],
            EstadoPedido.EN_CAMINO: [EstadoPedido.ENTREGADO],
            EstadoPedido.ENTREGADO: [],  # Terminal
            EstadoPedido.CANCELADO: [],  # Terminal
        }
        
        return estado_nuevo in transiciones_validas.get(estado_actual, [])
