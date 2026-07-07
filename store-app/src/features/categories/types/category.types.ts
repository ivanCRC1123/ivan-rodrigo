export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CategoriaTreeNode extends Categoria {
  children: CategoriaTreeNode[];
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
