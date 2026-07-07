export interface CategoriaRead {
  id: number;

  nombre: string;
  descripcion?: string;
  imagen_url?: string;

  parent_id?: number | null;

  created_at: string;
  updated_at: string;
}

export interface CategoriaReadSimple {
  id: number;
  nombre: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number | null;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number | null;
}
