export interface MetodoPago {
  id_pago?: number;
  nombre: string;
}

export interface MetodoPagoResponse<T> {
  success: boolean;
  mensaje?: string;
  count?: number;
  data?: T;
  error?: string;
}