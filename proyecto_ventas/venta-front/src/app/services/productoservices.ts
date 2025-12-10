import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Producto, ProductoResponse } from '../models/productointerface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = `${environment.apiUrl}/productos`

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<ProductoResponse<Producto[]>> {
    return this.http.get<ProductoResponse<Producto[]>>(this.apiUrl);
  }

  obtenerProductoPorId(id: number): Observable<ProductoResponse<Producto>> {
    return this.http.get<ProductoResponse<Producto>>(`${this.apiUrl}/${id}`);
  }

  eliminarProducto(id: number): Observable<ProductoResponse<void>> {
    return this.http.delete<ProductoResponse<void>>(`${this.apiUrl}/${id}`);
  }

  crearProducto(producto: Producto): Observable<ProductoResponse<Producto>> {
    return this.http.post<ProductoResponse<Producto>>(this.apiUrl, producto);
  }

  actualizarProducto(id: number, producto: Producto): Observable<ProductoResponse<Producto>> {
    return this.http.put<ProductoResponse<Producto>>(`${this.apiUrl}/${id}`, producto);
  }

  obtenerProductosPorCategoria(idCategoria: number): Observable<ProductoResponse<Producto[]>> {
    return this.http.get<ProductoResponse<Producto[]>>(`${this.apiUrl}/categoria/${idCategoria}`);
  }

  obtenerProductosStockBajo(minimo?: number): Observable<ProductoResponse<Producto[]>> {
    let url = `${this.apiUrl}/inventario/stock-bajo`;
    if (minimo) {
      url += `?minimo=${minimo}`;
    }
    return this.http.get<ProductoResponse<Producto[]>>(url);
  }

  buscarProductos(termino: string): Observable<ProductoResponse<Producto[]>> {
    return this.http.get<ProductoResponse<Producto[]>>(`${this.apiUrl}/buscar/productos?termino=${termino}`);
  }

  actualizarStock(id: number, cantidad: number, operacion: 'sumar' | 'restar'): Observable<ProductoResponse<Producto>> {
    return this.http.patch<ProductoResponse<Producto>>(`${this.apiUrl}/${id}/stock`, { cantidad, operacion });
  }

  obtenerProductosMasVendidos(limite?: number): Observable<ProductoResponse<Producto[]>> {
    let url = `${this.apiUrl}/reportes/mas-vendidos`;
    if (limite) {
      url += `?limite=${limite}`;
    }
    return this.http.get<ProductoResponse<Producto[]>>(url);
  }
}