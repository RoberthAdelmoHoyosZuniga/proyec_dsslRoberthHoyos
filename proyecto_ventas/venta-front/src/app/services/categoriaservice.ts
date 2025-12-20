import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Categoria, CategoriaResponse } from '../models/categoriainterface';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {

    private apiUrl = `${environment.apiUrl}/categorias`;

    constructor(private http: HttpClient) { }

    obtenerCategorias(): Observable<CategoriaResponse<Categoria[]>> {
        return this.http.get<CategoriaResponse<Categoria[]>>(this.apiUrl);
    }

    obtenerCategoriaPorId(id: number): Observable<CategoriaResponse<Categoria>> {
        return this.http.get<CategoriaResponse<Categoria>>(`${this.apiUrl}/${id}`);
    }
}
