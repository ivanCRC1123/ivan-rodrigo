export interface IngredienteRead {
  id: number;

  nombre: string;
  descripcion?: string;
  es_alergeno: boolean;

  created_at: string;
  updated_at: string;
}
