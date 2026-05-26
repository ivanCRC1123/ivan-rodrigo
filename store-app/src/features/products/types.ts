export interface Product {
  id: number; // El backend devuelve id como number
  nombre: string; // Backend usa 'nombre'
  precio_base: number; // Backend usa 'precio_base'
  descripcion: string; // Backend usa 'descripcion'
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  categorias: { id: number; nombre: string }[];
  ingredientes: { id: number; nombre: string }[];
}
