from fastapi import APIRouter, Path, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.database import engine
from app.core.security import decode_access_token
from app.core.ws_manager import ws_manager
from app.modules.pedido.models import Pedido
from app.modules.usuario.models import Usuario

ws_router = APIRouter()


async def _validar_token_ws(
    ws: WebSocket, token: str | None
) -> Usuario | None:
    """Valida el token y devuelve el usuario o None si es inválido."""
    if not token:
        await ws.close(code=4001, reason="Token requerido")
        return None

    payload = decode_access_token(token)
    if not payload:
        await ws.close(code=4001, reason="Token inválido o expirado")
        return None

    user_id = payload.get("user_id")
    with Session(engine) as session:
        usuario = session.exec(
            select(Usuario)
            .where(Usuario.id == int(user_id), Usuario.deleted_at.is_(None))
            .options(selectinload(Usuario.roles))
        ).first()

    if not usuario or not usuario.is_active():
        await ws.close(code=4001, reason="Usuario inválido")
        return None

    return usuario


@ws_router.websocket("/ws/pedidos")
async def ws_pedidos_admin(ws: WebSocket, token: str | None = Query(default=None)):
    """WebSocket para admin — recibe eventos de todos los pedidos en tiempo real."""
    await ws.accept()
    usuario = await _validar_token_ws(ws, token)
    if not usuario:
        return

    if not {r.codigo for r in usuario.roles} & {"ADMIN", "PEDIDOS"}:
        await ws.close(code=4003, reason="Sin permisos")
        return

    ws_manager._connections["admin"].add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(ws, "admin")


@ws_router.websocket("/ws/mis-pedidos")
async def ws_mis_pedidos_cliente(ws: WebSocket, token: str | None = Query(default=None)):
    """WebSocket para CLIENT — recibe eventos de TODOS sus pedidos en tiempo real."""
    await ws.accept()
    usuario = await _validar_token_ws(ws, token)
    if not usuario:
        return

    canal = f"user:{usuario.id}"
    ws_manager._connections[canal].add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(ws, canal)


@ws_router.websocket("/ws/catalogo")
async def ws_catalogo(ws: WebSocket, token: str | None = Query(default=None)):
    """WebSocket público — recibe eventos cuando cambian productos o categorías.
    No requiere autenticación (el catálogo es público)."""
    await ws.accept()

    ws_manager._connections["catalogo"].add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(ws, "catalogo")


@ws_router.websocket("/ws/pedidos/{pedido_id}")
async def ws_pedido_cliente(
    ws: WebSocket,
    pedido_id: int = Path(gt=0),
    token: str | None = Query(default=None),
):
    """WebSocket para CLIENT — recibe eventos de UN pedido específico en tiempo real."""
    await ws.accept()
    usuario = await _validar_token_ws(ws, token)
    if not usuario:
        return

    user_roles = {r.codigo for r in usuario.roles}
    es_admin = bool(user_roles & {"ADMIN", "PEDIDOS"})

    # Si no es admin, verificar que el pedido le pertenece
    if not es_admin:
        with Session(engine) as session:
            pedido = session.get(Pedido, pedido_id)
            if not pedido or pedido.usuario_id != usuario.id:
                await ws.close(code=4003, reason="El pedido no pertenece al usuario")
                return

    canal = str(pedido_id)
    ws_manager._connections[canal].add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(ws, canal)
