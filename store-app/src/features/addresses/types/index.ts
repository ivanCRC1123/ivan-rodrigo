// GET /api/v1/direcciones/ returns DireccionEntregaReadSimple[]
export interface DireccionEntregaReadSimple {
  id: number;
  alias: string;
  localidad: string;
  numero: string;
  calle: string;
  es_principal: boolean;
}

// POST /api/v1/direcciones/ body — DireccionEntregaCreateCliente
export interface DireccionEntregaCreateCliente {
  alias: string;
  calle: string;
  numero: string;
  apartamento?: string;
  localidad: string;
  codigo_postal?: string;
  provincia?: string;
  notas?: string;
  es_principal?: boolean;
}

// POST /api/v1/direcciones/ response — DireccionCreatedResponse
export interface DireccionCreatedResponse {
  mensaje: string;
  direccion_id: number;
  alias: string;
  es_principal: boolean;
}

// PATCH /api/v1/direcciones/{id}/principal response — DireccionPrincipalResponse
export interface DireccionPrincipalResponse {
  mensaje: string;
  direccion_id: number;
  alias: string;
  es_principal: boolean;
}

// Esquema de lectura completo para posible uso futuro (DireccionEntregaRead)
export interface DireccionEntregaRead {
  id: number;
  usuario_id: number;
  alias: string;
  calle: string;
  numero: string;
  apartamento: string | null;
  localidad: string;
  codigo_postal: string | null;
  provincia: string | null;
  notas: string | null;
  es_principal: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
