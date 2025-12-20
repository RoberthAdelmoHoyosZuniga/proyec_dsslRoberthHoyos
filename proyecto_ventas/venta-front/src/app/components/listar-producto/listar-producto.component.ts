import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../services/productoservices';
import { Producto } from '../../models/productointerface';

@Component({
  selector: 'app-listar-producto',
  standalone: true,
  imports: [CommonModule, RouterLink], // Agrega estos imports
  templateUrl: './listar-producto.component.html',
  styleUrl: './listar-producto.component.css'
})
export class ListarProductoComponent implements OnInit {
  productos: Producto[] = [];

  constructor(private readonly productoService: ProductoService) { }

  ngOnInit(): void {
    // Aquí cargarías tus productos desde el servicio
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productos = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }
}