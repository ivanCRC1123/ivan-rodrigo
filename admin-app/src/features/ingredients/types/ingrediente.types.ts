export interface IngredienteRead {
  id: number;

  nombre: string;
  descripcion?: string;
  es_alergeno: boolean;
  stock_cantidad: number;

  created_at: string;
  updated_at: string;
}

export interface IngredienteReadSimple {
  id: number;
  nombre: string;
}

export interface IngredienteCreate {
  nombre: string;
  descripcion?: string;
  es_alergeno?: boolean;
  stock_cantidad?: number;
}

export interface IngredienteUpdate {
  nombre?: string;
  descripcion?: string;
  es_alergeno?: boolean;
  stock_cantidad?: number;
}
