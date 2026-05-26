import type { CategoriaRead } from "./CategoriaRead";
import type { IngredienteRead } from "./IngredienteRead";

export interface ProductoRead {
  id: number;

  nombre: string;
  descripcion?: string;
  precio_base: number;

  imagenes_url: string[];

  stock_cantidad: number;
  disponible: boolean;

  categorias: CategoriaRead[];
  ingredientes: IngredienteRead[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}