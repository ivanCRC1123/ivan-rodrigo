import type { CategoriaRead } from "../../categories/types/categoria.types";

export interface Categoria {
  id: number;
  nombre: string;
}

export interface IngredienteDetalle {
  id: number;
  nombre: string;
  cantidad: number;
  unidad_medida: string;
  es_alergeno: boolean;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  precio_base: number;

  imagenes_url?: string[];

  stock_cantidad?: number;
  disponible?: boolean;
  unidad_venta_id?: number | null;
}

export interface ProductoRead {
  id: number;

  nombre: string;
  descripcion?: string;
  precio_base: number;

  imagenes_url: string[];

  stock_cantidad: number;
  disponible: boolean;
  unidad_venta_id?: number | null;

  categorias: CategoriaRead[];
  ingredientes: IngredienteDetalle[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio_base?: number;

  imagenes_url?: string[];

  stock_cantidad?: number;
  disponible?: boolean;
  unidad_venta_id?: number | null;
}
