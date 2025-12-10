import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-listar-producto',
  standalone: true,
  imports: [CommonModule, RouterLink], // Agrega estos imports
  templateUrl: './listar-producto.component.html',
  styleUrl: './listar-producto.component.css'
})
export class ListarProductoComponent implements OnInit {
  productos: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // Aquí cargarías tus productos desde el servicio
    this.cargarProductos();
  }

  cargarProductos(): void {
    // Datos de ejemplo
    this.productos = [
      { id_producto: 1, nombre: 'Producto 1', precio: 100, stock: 50 },
      { id_producto: 2, nombre: 'Producto 2', precio: 200, stock: 30 },
      { id_producto: 3, nombre: 'Producto 3', precio: 150, stock: 20 }
    ];
  }
}