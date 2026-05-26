export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio_base?: number;

  imagenes_url?: string[];

  stock_cantidad?: number;
  disponible?: boolean;
}