export interface Usuario {
  id_usuario?: number;
  nombre: string;
  usuario: string;
  password?: string;
  rol: string;
}

export interface UsuarioResponse<T> {
  success: boolean;
  mensaje?: string;
  count?: number;
  data?: T;
  error?: string;
}