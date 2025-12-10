export interface Producto {
  id_producto?: number;
  nombre: string;
  precio: number;
  stock: number;
  id_categoria: number;

  // Campos adicionales del JOIN
  categoria?: string;
  total_vendido?: number;
  ingresos_generados?: number;
}

export interface ProductoResponse<T> {
  success: boolean;
  mensaje?: string;
  count?: number;
  stockMinimo?: number;
  termino?: string;
  stockActual?: number;
  data?: T;
  error?: string;
}