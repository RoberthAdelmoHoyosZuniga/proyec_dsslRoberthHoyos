import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/ventasservices';
import { ProductoService } from '../../services/productoservices';
import { Venta, ProductoDetalleReporte } from '../../models/ventasinterface';

@Component({
    selector: 'app-listar-venta',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './listar-venta.component.html',
    styleUrl: './listar-venta.component.css'
})
export class ListarVentaComponent implements OnInit {
    ventas: Venta[] = [];
    loading: boolean = true;
    error: string | null = null;
    fechaFiltro: string = '';
    totalVentasDia: number = 0;
    totalProductosDia: number = 0;
    stockTotalDisponible: number = 0;
    productosDetalleDia: ProductoDetalleReporte[] = [];

    constructor(
        private readonly ventaService: VentaService,
        private readonly productoService: ProductoService
    ) { }

    ngOnInit(): void {
        this.cargarVentas();
        this.cargarStockTotal();
    }

    cargarStockTotal(): void {
        this.productoService.obtenerProductos().subscribe({
            next: (response: any) => {
                if (response.success && response.data) {
                    this.stockTotalDisponible = response.data.reduce((acc: number, p: any) => acc + (p.stock || 0), 0);
                }
            },
            error: (err: any) => console.error('Error al cargar stock total:', err)
        });
    }

    cargarVentas(): void {
        this.loading = true;
        this.error = null;
        this.ventaService.obtenerVentas().subscribe({
            next: (response: any) => {
                if (response.success && response.data) {
                    this.ventas = response.data;
                    this.totalVentasDia = this.ventas.reduce((acc: number, v: any) => acc + Number(v.total), 0);
                    this.totalProductosDia = this.ventas.reduce((acc: number, v: any) => acc + (v.total_productos || 0), 0);
                    this.cargarStockTotal(); // Actualizar stock tras cargar ventas
                } else {
                    this.error = response.mensaje || 'Error al cargar el historial de ventas';
                }
                this.loading = false;
            },
            error: (err: any) => {
                this.error = 'Ocurrió un error al conectar con el servidor';
                this.loading = false;
                console.error(err);
            }
        });
    }

    filtrarPorFecha(): void {
        if (!this.fechaFiltro) {
            this.cargarVentas();
            return;
        }

        this.loading = true;
        this.error = null;
        this.ventaService.obtenerVentasPorFecha(this.fechaFiltro, this.fechaFiltro).subscribe({
            next: (response: any) => {
                if (response.success && response.data) {
                    this.ventas = response.data;
                    this.totalVentasDia = response.totalVentas ? Number.parseFloat(response.totalVentas) : 0;
                    this.totalProductosDia = response.totalCantidad ? Number.parseInt(response.totalCantidad.toString()) : 0;
                    this.productosDetalleDia = response.productos_detalle || [];
                } else {
                    this.error = response.mensaje || 'No hay ventas para la fecha seleccionada';
                    this.ventas = [];
                    this.totalVentasDia = 0;
                    this.productosDetalleDia = [];
                }
                this.loading = false;
            },
            error: (err: any) => {
                this.error = 'Ocurrió un error al filtrar por fecha';
                this.loading = false;
                console.error(err);
            }
        });
    }

    limpiarFiltro(): void {
        this.fechaFiltro = '';
        this.productosDetalleDia = [];
        this.cargarVentas();
    }
}
