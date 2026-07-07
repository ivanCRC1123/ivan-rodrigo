export interface UnidadMedidaRead {
  id: number;
  nombre: string;
  simbolo: string;
  tipo: string;
  created_at: string;
}

export interface UnidadMedidaCreate {
  nombre: string;
  simbolo: string;
  tipo: string;
}

export interface UnidadMedidaUpdate {
  nombre?: string;
  simbolo?: string;
  tipo?: string;
}
