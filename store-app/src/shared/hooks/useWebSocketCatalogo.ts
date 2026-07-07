import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const WS_BASE = "ws://localhost:8000";

/**
 * Hook que se conecta al WebSocket /ws/catalogo del backend
 * e invalida la query ["products"] al recibir cualquier evento,
 * forzando que ProductsPage se refresque automáticamente
 * cuando admin crea/edita/elimina productos o categorías.
 *
 * Es público — no requiere token (el catálogo es de acceso público).
 */
export function useWebSocketCatalogo() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    function connect() {
      if (!mounted) return;
      const ws = new WebSocket(`${WS_BASE}/ws/catalogo`);
      wsRef.current = ws;

      ws.onopen = () => {
        // conectado
      };

      ws.onmessage = () => {
        // Cualquier evento → refrescar listado de productos
        queryClient.invalidateQueries({ queryKey: ["products"] });
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
