import { Usuario } from "./usuariointerface";

export interface LoginRequest {
    usuario: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    mensaje: string;
    token?: string;
    usuario?: Usuario;
    error?: string;
}
