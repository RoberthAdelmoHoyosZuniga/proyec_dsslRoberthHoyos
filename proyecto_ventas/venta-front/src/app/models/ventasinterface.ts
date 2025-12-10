
export interface Venta {
  id_venta?: number;
  fecha?: Date | string;
  id_cliente: number;
  id_usuario: number;
  id_pago: number;
  total: number;
  detalles?: DetalleVenta[];

  // Campos adicionales del JOIN
  cliente_nombre?: string;
  cliente_apellido?: string;
  dni?: string;
  telefono?: string;
  correo?: string;
  vendedor?: string;
  metodo_pago?: string;
}

export interface DetalleVenta {
  id_detalle?: number;
  id_venta?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
  producto?: string;
}

export interface VentaResponse<T> {
  success: boolean;
  mensaje?: string;
  count?: number;
  totalVentas?: string;
  data?: T;
  error?: string;
}