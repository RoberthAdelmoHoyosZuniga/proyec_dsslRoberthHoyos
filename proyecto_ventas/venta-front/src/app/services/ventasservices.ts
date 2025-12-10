import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Venta, VentaResponse } from '../models/ventasinterface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private apiUrl = `${environment.apiUrl}/ventas`

  constructor(private http: HttpClient) { }

  obtenerVentas(): Observable<VentaResponse<Venta[]>> {
    return this.http.get<VentaResponse<Venta[]>>(this.apiUrl);
  }

  obtenerVentaPorId(id: number): Observable<VentaResponse<Venta>> {
    return this.http.get<VentaResponse<Venta>>(`${this.apiUrl}/${id}`);
  }

  eliminarVenta(id: number): Observable<VentaResponse<void>> {
    return this.http.delete<VentaResponse<void>>(`${this.apiUrl}/${id}`);
  }

  crearVenta(venta: Venta): Observable<VentaResponse<Venta>> {
    return this.http.post<VentaResponse<Venta>>(this.apiUrl, venta);
  }

  actualizarVenta(id: number, venta: Venta): Observable<VentaResponse<Venta>> {
    return this.http.put<VentaResponse<Venta>>(`${this.apiUrl}/${id}`, venta);
  }

  obtenerVentasPorCliente(idCliente: number): Observable<VentaResponse<Venta[]>> {
    return this.http.get<VentaResponse<Venta[]>>(`${this.apiUrl}/cliente/${idCliente}`);
  }

  obtenerVentasPorVendedor(idVendedor: number): Observable<VentaResponse<Venta[]>> {
    return this.http.get<VentaResponse<Venta[]>>(`${this.apiUrl}/vendedor/${idVendedor}`);
  }

  obtenerVentasPorCategoria(idCategoria: number): Observable<VentaResponse<Venta[]>> {
    return this.http.get<VentaResponse<Venta[]>>(`${this.apiUrl}/categoria/${idCategoria}`);
  }

  obtenerVentasPorFecha(fechaInicio?: string, fechaFin?: string): Observable<VentaResponse<Venta[]>> {
    let url = `${this.apiUrl}/reporte/fechas`;
    const params: string[] = [];

    if (fechaInicio) {
      params.push(`fechaInicio=${fechaInicio}`);
    }
    if (fechaFin) {
      params.push(`fechaFin=${fechaFin}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<VentaResponse<Venta[]>>(url);
  }
}