import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/useAuthStore";

const WS_BASE = "ws://localhost:8000";

/**
 * Hook que se conecta al WebSocket /ws/mis-pedidos del backend
 * e invalida la query ["mis-pedidos"] al recibir cualquier evento,
 * forzando que MyOrdersPage se refresque automáticamente.
 */
export function useWebSocketMisPedidos() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    let mounted = true;

    function connect() {
      if (!mounted) return;
      const ws = new WebSocket(`${WS_BASE}/ws/mis-pedidos?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        // conectado
      };

      ws.onmessage = () => {
        // Cualquier evento → refrescar lista de pedidos
        queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
      };

      ws.onclose = () => {
        if (!mounted) return;
        // Reconectar cada 5s
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      mounted = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [queryClient]);
}
