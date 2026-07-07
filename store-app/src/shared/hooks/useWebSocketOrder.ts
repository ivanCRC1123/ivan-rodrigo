import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

const WS_BASE = "ws://localhost:8000";

export interface WsEvent {
  event: string;
  pedido_id: number;
  estado_anterior?: string;
  estado_nuevo?: string;
  [key: string]: unknown;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

/**
 * Hook que conecta al WebSocket de un pedido específico y recibe eventos en tiempo real.
 * Se reconecta automáticamente si la conexión se cierra.
 */
export function useWebSocketOrder(pedidoId: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const connect = useCallback(() => {
    if (!pedidoId) return;

    const token = useAuthStore.getState().token;
    if (!token) {
      setStatus("error");
      return;
    }

    // Cerrar conexión anterior si existe
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus("connecting");
    const url = `${WS_BASE}/ws/pedidos/${pedidoId}?token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);
        setLastEvent(data);
      } catch {
        // ignorar mensajes no JSON
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      // Reconectar después de 3 segundos
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      setStatus("error");
      ws.close();
    };
  }, [pedidoId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { lastEvent, status };
}
