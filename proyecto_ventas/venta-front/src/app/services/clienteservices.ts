import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Cliente, ClienteResponse } from '../models/clienteinterface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = `${environment.apiUrl}/clientes`

  constructor(private http: HttpClient) { }

  obtenerClientes(): Observable<ClienteResponse<Cliente[]>> {
    return this.http.get<ClienteResponse<Cliente[]>>(this.apiUrl);
  }

  obtenerClientePorId(id: number): Observable<ClienteResponse<Cliente>> {
    return this.http.get<ClienteResponse<Cliente>>(`${this.apiUrl}/${id}`);
  }

  eliminarCliente(id: number): Observable<ClienteResponse<void>> {
    return this.http.delete<ClienteResponse<void>>(`${this.apiUrl}/${id}`);
  }

  crearCliente(cliente: Cliente): Observable<ClienteResponse<Cliente>> {
    return this.http.post<ClienteResponse<Cliente>>(this.apiUrl, cliente);
  }

  actualizarCliente(id: number, cliente: Cliente): Observable<ClienteResponse<Cliente>> {
    return this.http.put<ClienteResponse<Cliente>>(`${this.apiUrl}/${id}`, cliente);
  }

  buscarClientePorDni(dni: string): Observable<ClienteResponse<Cliente>> {
    return this.http.get<ClienteResponse<Cliente>>(`${this.apiUrl}/buscar/dni/${dni}`);
  }

  obtenerClientesActivos(): Observable<ClienteResponse<Cliente[]>> {
    return this.http.get<ClienteResponse<Cliente[]>>(`${this.apiUrl}/activos/lista`);
  }
}