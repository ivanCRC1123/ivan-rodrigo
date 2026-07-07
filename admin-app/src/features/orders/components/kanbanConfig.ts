import type { EstadoPedidoEnum } from "../types";

export interface KanbanColumnConfig {
  estado: EstadoPedidoEnum;
  label: string;
  color: string;
  /** Tailwind classes for background */
  bgClass: string;
  /** Tailwind classes for text */
  textClass: string;
  /** Tailwind classes for border */
  borderClass: string;
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    estado: "PENDIENTE",
    label: "Pendientes",
    color: "yellow",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-400",
    borderClass: "border-yellow-500/30",
  },
  {
    estado: "CONFIRMADO",
    label: "Confirmados",
    color: "blue",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
    borderClass: "border-blue-500/30",
  },
  {
    estado: "EN_PREPARACION",
    label: "En Preparación",
    color: "purple",
    bgClass: "bg-purple-500/20",
    textClass: "text-purple-400",
    borderClass: "border-purple-500/30",
  },
  {
    estado: "ENTREGADO",
    label: "Entregados",
    color: "green",
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
    borderClass: "border-green-500/30",
  },
  {
    estado: "CANCELADO",
    label: "Cancelados",
    color: "red",
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    borderClass: "border-red-500/30",
  },
];

/** Mapa de transiciones válidas: estadoActual → estadosDestino */
export const TRANSICIONES_VALIDAS: Record<EstadoPedidoEnum, EstadoPedidoEnum[]> = {
  PENDIENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

/** Mapa de colores Tailwind por estado */
export const ESTADO_COLORS: Record<EstadoPedidoEnum, string> = {
  PENDIENTE: "bg-yellow-500/20 text-yellow-400",
  CONFIRMADO: "bg-blue-500/20 text-blue-400",
  EN_PREPARACION: "bg-purple-500/20 text-purple-400",
  ENTREGADO: "bg-green-500/20 text-green-400",
  CANCELADO: "bg-red-500/20 text-red-400",
};

/** Labels en español por estado */
export const ESTADO_LABELS: Record<EstadoPedidoEnum, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En Preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Labels para botones de transición */
export const TRANSITION_LABELS: Record<string, string> = {
  CONFIRMADO: "Confirmar",
  EN_PREPARACION: "Iniciar preparación",
  ENTREGADO: "Marcar entregado",
  CANCELADO: "Cancelar",
};
