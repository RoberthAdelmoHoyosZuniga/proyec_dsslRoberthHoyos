export interface Categoria {
    id_categoria: number;
    nombre: string;
}

export interface CategoriaResponse<T> {
    success: boolean;
    mensaje?: string;
    count?: number;
    data?: T;
    error?: string;
}
