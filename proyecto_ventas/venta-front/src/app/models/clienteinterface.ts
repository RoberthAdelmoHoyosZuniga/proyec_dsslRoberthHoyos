export interface Cliente {
  id_cliente?: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  correo?: string;
}

export interface ClienteResponse<T> {
  success: boolean;
  mensaje?: string;
  count?: number;
  data?: T;
  error?: string;
}