import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Usuario, UsuarioResponse } from '../models/usuariointerface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/usuarios`

  constructor(private http: HttpClient) { }

  obtenerUsuarios(): Observable<UsuarioResponse<Usuario[]>> {
    return this.http.get<UsuarioResponse<Usuario[]>>(this.apiUrl);
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioResponse<Usuario>> {
    return this.http.get<UsuarioResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

  eliminarUsuario(id: number): Observable<UsuarioResponse<void>> {
    return this.http.delete<UsuarioResponse<void>>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: Usuario): Observable<UsuarioResponse<Usuario>> {
    return this.http.post<UsuarioResponse<Usuario>>(this.apiUrl, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<UsuarioResponse<Usuario>> {
    return this.http.put<UsuarioResponse<Usuario>>(`${this.apiUrl}/${id}`, usuario);
  }
}