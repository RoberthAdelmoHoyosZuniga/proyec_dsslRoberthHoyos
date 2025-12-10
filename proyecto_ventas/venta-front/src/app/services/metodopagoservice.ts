import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { MetodoPago, MetodoPagoResponse } from '../models/metodopagointerface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoService {

  private apiUrl = `${environment.apiUrl}/metodos-pago`

  constructor(private http: HttpClient) { }

  obtenerMetodosPago(): Observable<MetodoPagoResponse<MetodoPago[]>> {
    return this.http.get<MetodoPagoResponse<MetodoPago[]>>(this.apiUrl);
  }

  obtenerMetodoPagoPorId(id: number): Observable<MetodoPagoResponse<MetodoPago>> {
    return this.http.get<MetodoPagoResponse<MetodoPago>>(`${this.apiUrl}/${id}`);
  }

  eliminarMetodoPago(id: number): Observable<MetodoPagoResponse<void>> {
    return this.http.delete<MetodoPagoResponse<void>>(`${this.apiUrl}/${id}`);
  }

  crearMetodoPago(metodoPago: MetodoPago): Observable<MetodoPagoResponse<MetodoPago>> {
    return this.http.post<MetodoPagoResponse<MetodoPago>>(this.apiUrl, metodoPago);
  }

  actualizarMetodoPago(id: number, metodoPago: MetodoPago): Observable<MetodoPagoResponse<MetodoPago>> {
    return this.http.put<MetodoPagoResponse<MetodoPago>>(`${this.apiUrl}/${id}`, metodoPago);
  }
}