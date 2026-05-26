export interface CategoriaRead {
  id: number;

  nombre: string;
  descripcion?: string;
  imagen_url?: string;

  parent_id?: number | null;

  created_at: string;
  updated_at: string;
}